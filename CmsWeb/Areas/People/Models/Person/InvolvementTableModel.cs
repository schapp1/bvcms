﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Caching;
using System.Web.Mvc;
using System.Xml.Linq;
using System.Xml.XPath;
using CmsData;
using UtilityExtensions;

namespace CmsWeb.Areas.People.Models
{
    public class InvolvementTableColumn
    {
        public string Page { get; set; }
        public string Field { get; set; }
        public bool Sortable { get; set; }
    }

    public class InvolvementTableModel
    {
        public static List<InvolvementTableColumn> GetColumns(string page)
        {
            string customTextName, defaultXml;
            switch (page)
            {
                default:
                    customTextName = "InvolvementTableCurrent";
                    break;
                case "Pending":
                    customTextName = "InvolvementTablePending";
                    break;
                case "Previous":
                    customTextName = "InvolvementTablePrevious";
                    break;
            }

            var db = DbUtil.Db;

            var s = HttpRuntime.Cache[DbUtil.Db.Host + customTextName] as string;
            if (s == null)
            {
                s = db.ContentText(customTextName, Resource1.ReportsMenuCustom);
                HttpRuntime.Cache.Insert(db.Host + customTextName, s, null,
                    DateTime.Now.AddMinutes(Util.IsDebug() ? 0 : 1), Cache.NoSlidingExpiration);
            }
            if (!s.HasValue())
                return null;

            var xdoc = XDocument.Parse(s);

            if (xdoc?.Root == null)
                return new List<InvolvementTableColumn>();

            var list = new List<InvolvementTableColumn>();
            foreach (var e in xdoc.XPathSelectElements("/InvolvementTable/Columns").Elements())
            {
                if (e.Name.LocalName.ToLower() == "column")
                {
                    var column = new InvolvementTableColumn();
                    column.Field = e.Attribute("field")?.Value;
                    column.Page = page;

                    bool sortable;
                    bool.TryParse(e.Attribute("sortable")?.Value ?? "false", out sortable);
                    column.Sortable = sortable;

                    list.Add(column);
                }
            }
            return list;
        }
    }
}