﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using CmsData;
using System.Web.Mvc;
using System.Xml.Serialization;
using System.IO;
using Newtonsoft.Json;
using NPOI.SS.Formula.Functions;
using UtilityExtensions;

namespace CmsWeb.Code
{
    public class StandardExtraValues
    {
        [Serializable]
        public class Fields
        {
            [XmlElement("Field")]
            public Field[] fields { get; set; }
        }
        [Serializable]
        public class Field
        {
            [XmlAttribute]
            public string name { get; set; }
            [XmlAttribute]
            public string type { get; set; }
            [XmlAttribute]
            public string location { get; set; }
            [XmlAttribute]
            public string VisibilityRoles { get; set; }
            public List<string> Codes { get; set; }
            internal int order;
            public int peopleid;
            public bool nonstandard;
            public bool standard { get { return !nonstandard; } }

            internal PeopleExtra extravalue;
            internal static Field AddField(Field f, PeopleExtra v)
            {
                if (f == null)
                {
                    f = new Field
                    {
                        name = v.Field,
                        nonstandard = true,
                        peopleid = v.PeopleId,
                        extravalue = v,
                    };
                    f.type = v.StrValue.HasValue() ? "Code"
                        : v.Data.HasValue() ? "Data"
                        : v.DateValue.HasValue ? "Date"
                        : v.IntValue.HasValue ? "Int"
                        : v.BitValue.HasValue ? "Bit"
                        : "Code";
                }
                f.extravalue = v;
                return f;
            }
            public bool UserCanView()
            {
                if (!VisibilityRoles.HasValue())
                    return true;
                var a = VisibilityRoles.SplitStr(",");
                var user = HttpContext.Current.User;
                return a.Any(role => user.IsInRole(role.Trim()));
            }
            public bool UserCanEdit()
            {
                var user = HttpContext.Current.User;
                return user.IsInRole("Edit");
            }
            public override string ToString()
            {
                if (extravalue == null && type != "Bits")
                    return "Click to edit";
                if (extravalue == null)
                    extravalue = new PeopleExtra();
                switch (type)
                {
                    case "Code":
                        return extravalue.StrValue;
                    case "Data":
                        return extravalue.Data;
                    case "Date":
                        return extravalue.DateValue.FormatDate();
                    case "Bit":
                        return extravalue.BitValue.ToString();
                    case "Bits":
                        {
                            var q = from e in DbUtil.Db.PeopleExtras
                                    where e.BitValue == true
                                    where e.PeopleId == peopleid
                                    where Codes.Contains(e.Field)
                                    select e.Field;
                            return string.Join(",", q);
                        }
                    case "Int":
                        if (extravalue.IntValue2.HasValue)
                            return "{0} {1}".Fmt(extravalue.IntValue, extravalue.IntValue2);
                        return extravalue.IntValue.ToString();
                }
                return "";
            }

            public string EditableDataSource
            {
                get
                {
                    var n = HttpUtility.UrlEncode(name);
                    var source = "";
                    if (type == "Code" && standard)
                        source = "/Person2/ExtraValueCodes/{0}".Fmt(n);
                    else if(type == "Bits")
                        source = "/Person2/ExtraValueBits/{0}/{1}".Fmt(peopleid, n);
                    else if (type == "Bit")
                        source = "{'1': 'true'}";
                    return source.HasValue() ? "data-source={0}".Fmt(source) : "";
                }
            }
            public string EditableDataType
            {
                get
                {
                    return "click-{0}{1}".Fmt(type, type == "Code" && standard ? "-Select" : "");
                }
            }
            public string EditableDataValue
            {
                get
                {
                    if (type == "Code")
                        return "data-value={0}".Fmt(this);
                    if (type.StartsWith("Bit"))
                        return "data-value={0}".Fmt(ExtraValueSetBitsJson(peopleid, name)).Replace('"', '\'');
                    return "";
                }
            }
            public string EditableDataKey
            {
                get
                {
                    return "{0}-{1}".Fmt(type, peopleid);
                }
            }
            public string EditableDataName
            {
                get
                {
                    return HttpUtility.UrlEncode(name);
                }
            }
        }
        public static IEnumerable<Field> GetExtraValues()
        {
            var emptylist = new List<Field>() as IEnumerable<Field>;
            if (DbUtil.Db.Setting("UseStandardExtraValues", "false") != "true")
                return emptylist;
            var xml = DbUtil.StandardExtraValues();
            var sr = new StringReader(xml);
            var f = new XmlSerializer(typeof(Fields)).Deserialize(sr) as Fields;
            return f != null ? (f.fields ?? emptylist) : emptylist;
        }

        private static readonly string[] standardDefault = new string[] { "standard", "default" };
        private static readonly string[] adhocDefault = new string[] { "adhoc", "default" };

        public static IEnumerable<Field> GetExtraValues(int PeopleId, string location = "default")
        {
            var emptylist = new List<Field>() as IEnumerable<Field>;
            var standardfields = GetExtraValues().ToList();
            location = location.ToLower();

            var n = 1;
            foreach (var f in standardfields)
            {
                f.order = n++;
                f.peopleid = PeopleId;
                if (f.location == null)
                    f.location = "default";
            }

            var personExtraValues = DbUtil.Db.PeopleExtras.Where(ee => ee.PeopleId == PeopleId).ToList();

            var standard = emptylist;
            var adhoc = emptylist;

            if (location != "adhoc")
            {
                standard = from f in standardfields
                           join v in personExtraValues on f.name equals v.Field into j
                           from v in j.DefaultIfEmpty()
                           where f.location == location || standardDefault.Contains(location)
                           orderby f.order
                           select Field.AddField(f, v);
            }
            if (adhocDefault.Contains(location))
            {
                adhoc = from v in personExtraValues
                        join f in standardfields on v.Field equals f.name into j
                        from f in j.DefaultIfEmpty()
                        where f == null
                        where !standardfields.Any(ff => ff.Codes.Any(cc => cc == v.Field))
                        orderby v.Field
                        select Field.AddField(f, v);
            }
            return standard.Concat(adhoc);
        }
        public static List<SelectListItem> ExtraValueCodes()
        {
            var q = from e in DbUtil.Db.PeopleExtras
                    where e.StrValue != null || e.BitValue != null
                    group e by new { e.Field, val = e.StrValue ?? (e.BitValue == true ? "1" : "0") }
                        into g
                        select g.Key;
            var list = q.ToList();

            var ev = GetExtraValues();
            var q2 = from e in list
                     let f = ev.SingleOrDefault(ff => ff.name == e.Field)
                     where f == null || f.UserCanView()
                     orderby e.Field, e.val
                     select new SelectListItem()
                            {
                                Text = e.Field + ":" + e.val,
                                Value = e.Field + ":" + e.val,
                            };
            return q2.ToList();
        }
        public static Dictionary<string, string> Codes(string name)
        {
            var f = GetExtraValues().Single(ee => ee.name == name);
            return f.Codes.ToDictionary(ee => ee, ee => ee);
        }

        public static string CodesJson(string name)
        {
            var f = GetExtraValues().Single(ee => ee.name == name);
            var q = from c in f.Codes
                    select new { value = c, text = c };
            return JsonConvert.SerializeObject(q.ToArray());
        }
        public static Dictionary<string, bool> ExtraValueBits(string name, int PeopleId)
        {
            var f = GetExtraValues().Single(ee => ee.name == name);
            var list = DbUtil.Db.PeopleExtras.Where(pp => pp.PeopleId == PeopleId && f.Codes.Contains(pp.Field)).ToList();
            var q = from c in f.Codes
                    join e in list on c equals e.Field into j
                    from e in j.DefaultIfEmpty()
                    select new { value = c, selected = (e != null && (e.BitValue ?? false)) };
            return q.ToDictionary(ee => ee.value, ee => ee.selected);
        }
        public static string ExtraValueBitsJson(int PeopleId, string name)
        {
            var f = GetExtraValues().Single(ee => ee.name == name);
            var list = DbUtil.Db.PeopleExtras.Where(pp => pp.PeopleId == PeopleId && f.Codes.Contains(pp.Field)).ToList();
            var q = from c in f.Codes
                    join e in list on c equals e.Field into j
                    from e in j.DefaultIfEmpty()
                    select new { value = c, text = c };
            return JsonConvert.SerializeObject(q.ToArray());
        }
        public static string ExtraValueSetBitsJson(int PeopleId, string name)
        {
            var f = GetExtraValues().Single(ee => ee.name == name);
            var list = DbUtil.Db.PeopleExtras.Where(pp => pp.PeopleId == PeopleId && f.Codes.Contains(pp.Field)).ToList();
            var q = from c in f.Codes
                    join e in list on c equals e.Field into j
                    from e in j.DefaultIfEmpty()
                    where e != null && e.BitValue == true
                    select c;
            return JsonConvert.SerializeObject(q.ToArray());
        }

        public static void EditExtra(string id, string name, string value)
        {
            var a = id.SplitStr("-", 2);
            var type = a[0];
            var pid = a[1].ToInt();
            var p = DbUtil.Db.LoadPersonById(pid);
            if (p == null)
                return;
            switch (type)
            {
                case "Code":
                    p.AddEditExtraValue(name, value);
                    break;
                case "Data":
                    p.AddEditExtraData(name, value);
                    break;
                case "Date":
                    {
                        DateTime dt;
                        if (DateTime.TryParse(value, out dt))
                        {
                            p.AddEditExtraDate(name, dt);
                            value = dt.ToShortDateString();
                        }
                        else
                        {
                            p.RemoveExtraValue(DbUtil.Db, name);
                            value = "";
                        }
                    }
                    break;
                case "Int":
                    p.AddEditExtraInt(name, value.ToInt());
                    break;
                case "Bit":
                    if (value == null)
                        value = HttpContext.Current.Request.Form["value[]"];
                    if (value == "True")
                        p.AddEditExtraBool(name, true);
                    else
                        p.RemoveExtraValue(DbUtil.Db, name);
                    break;
                case "Bits":
                    {
                        if (value == null)
                            value = HttpContext.Current.Request.Form["value[]"];

                        var cc = ExtraValueBits(name, pid);
                        var aa = value.Split(',');
                        foreach (var c in cc)
                        {
                            if (aa.Contains(c.Key)) // checked now
                                if (!c.Value) // was not checked before
                                    p.AddEditExtraBool(c.Key, true);
                            if (!aa.Contains(c.Key)) // not checked now
                                if (c.Value) // was checked before
                                    p.RemoveExtraValue(DbUtil.Db, c.Key);
                        }
                        break;
                    }
            }
            DbUtil.Db.SubmitChanges();
        }

        public static void NewExtra(int id, string field, string type, string value)
        {
            field = field.Replace('/', '-');
            var v = new PeopleExtra { PeopleId = id, Field = field };
            DbUtil.Db.PeopleExtras.InsertOnSubmit(v);
            switch (type)
            {
                case "string":
                    v.StrValue = value;
                    break;
                case "text":
                    v.Data = value;
                    break;
                case "date":
                    var dt = DateTime.MinValue;
                    DateTime.TryParse(value, out dt);
                    v.DateValue = dt;
                    break;
                case "int":
                    v.IntValue = value.ToInt();
                    break;
            }
            DbUtil.Db.SubmitChanges();
        }
    }
}