﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CmsData;
using UtilityExtensions;

namespace CmsWeb.Models.PersonPage
{
    public class PersonEnrollmentsModel
    {
        private int PeopleId;
        public Person person { get; set; }
        public PagerModel2 Pager { get; set; }
        public PersonEnrollmentsModel(int id)
        {
            PeopleId = id;
            person = DbUtil.Db.LoadPersonById(id);
            Pager = new PagerModel2(Count);
        }
        private IQueryable<OrganizationMember> _enrollments;
        private IQueryable<OrganizationMember> FetchEnrollments()
        {
            if (_enrollments == null)
            {
                var limitvisibility = Util2.OrgMembersOnly 
                    || !HttpContext.Current.User.IsInRole("Access");
                _enrollments = from om in DbUtil.Db.OrganizationMembers
                               where om.PeopleId == PeopleId
                               where (om.Pending ?? false) == false
                               where !(limitvisibility && om.Organization.SecurityTypeId == 3)
                               select om;
            }
            return _enrollments;
        }
        int? _count;
        public int Count()
        {
            if (!_count.HasValue)
                _count = FetchEnrollments().Count();
            return _count.Value;
        }
        public IEnumerable<OrgMemberInfo> Enrollments()
        {
            var q = ApplySort();
            q = q.Skip(Pager.StartRow).Take(Pager.PageSize);
            var q2 = from om in q
                     let sc = om.Organization.OrgSchedules.FirstOrDefault() // SCHED
                     select new OrgMemberInfo
                     {
                         OrgId = om.OrganizationId,
                         PeopleId = om.PeopleId,
                         Name = om.Organization.OrganizationName,
                         Location = om.Organization.Location,
                         LeaderName = om.Organization.LeaderName,
                         MeetingTime = sc.MeetingTime,
                         MemberType = om.MemberType.Description,
                         LeaderId = om.Organization.LeaderId,
                         EnrollDate = om.EnrollmentDate,
                         AttendPct = om.AttendPct,
                         DivisionName = om.Organization.Division.Program.Name + "/" + om.Organization.Division.Name,
                     };
            return q2;
        }
        private IQueryable<OrganizationMember> ApplySort()
        {
            var q = FetchEnrollments();
            switch (Pager.SortExpression)
            {
                case "Organization":
                    q = q.OrderBy(om => om.Organization.OrganizationName);
                    break;
                case "Enroll Date":
                    q = q.OrderBy(om => om.EnrollmentDate);
                    break;
                case "Organization desc":
                    q = q.OrderByDescending(om => om.Organization.OrganizationName);
                    break;
                case "Enroll Date desc":
                    q = q.OrderByDescending(om => om.EnrollmentDate);
                    break;
            }
            return q;
        }
    }
}
