using System;
using System.Collections.Generic;
using System.Linq;
using CmsData;

namespace CmsWeb.Areas.People.Models
{
    public class MemberDocModel
    {
        public int Id { get; set; }
        public DateTime? DocDate { get; set; }
        public int? ThumbId { get; set; }
        public int? Docid { get; set; }
        public string Uploader { get; set; }
        public bool? IsDocument { get; set; }
        public string Name { get; set; }
        public string FormName { get; set; }

        public string DocUrl
        {
            get
            {
                if (IsDocument == true)
                    return "/Image/" + Docid;
                return "/MemberDocs/Image/" + Id;
            }
        }

        public string ImgUrl
        {
            get
            {
                if (IsDocument == true)
                    return "/images/adobe.png";
                return "/Image/" + ThumbId;
            }
        }

        public static IEnumerable<MemberDocModel> DocForms(int id)
        {
            return from f in DbUtil.Db.MemberDocForms
                   where f.PeopleId == id
                   let uploader = DbUtil.Db.People.SingleOrDefault(uu => uu.PeopleId == f.UploaderId)
                   orderby f.DocDate
                   select new MemberDocModel
                   {
                       DocDate = f.DocDate,
                       Id = f.Id,
                       ThumbId = f.SmallId,
                       Docid = f.MediumId,
                       IsDocument = f.IsDocument,
                       Name = f.Person.Name,
                       FormName = f.Name,
                       Uploader = uploader.Name
                   };
        }
        public static void DeleteDocument(int id)
        {
            var m = DbUtil.Db.MemberDocForms.SingleOrDefault(mm => mm.Id == id);
            ImageData.Image.DeleteOnSubmit(m.SmallId);
            ImageData.Image.DeleteOnSubmit(m.MediumId);
            ImageData.Image.DeleteOnSubmit(m.LargeId);
            DbUtil.Db.MemberDocForms.DeleteOnSubmit(m);
            DbUtil.Db.SubmitChanges();
        }

        internal static void UpdateName(int pk, string value)
        {
            var m = DbUtil.Db.MemberDocForms.Single(mm => mm.Id == pk);
            m.Name = value;
            DbUtil.Db.SubmitChanges();
        }
    }
}
