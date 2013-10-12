﻿using System;
using CmsData;

namespace CmsWeb.Models.ExtraValues
{
    public class ExtraValue
    {
        public int Id;
        public string Field { get; set; }
        public string StrValue { get; set; }
        public DateTime? DateValue { get; set; }
        public string Data { get; set; }
        public int? IntValue { get; set; }
        public bool? BitValue { get; set; }
        public ExtraValueModel Model { get; set; }

        public ExtraValue() { }

        public ExtraValue(PeopleExtra v, ExtraValueModel model)
        {
            Field = v.Field;
            StrValue = v.StrValue;
            DateValue = v.DateValue;
            Data = v.Data;
            IntValue = v.IntValue;
            BitValue = v.BitValue;
            Id = v.PeopleId;
            Model = model;
        }
        public ExtraValue(FamilyExtra v, ExtraValueModel model)
        {
            Field = v.Field;
            StrValue = v.StrValue;
            DateValue = v.DateValue;
            Data = v.Data;
            IntValue = v.IntValue;
            BitValue = v.BitValue;
            Id = v.FamilyId;
            Model = model;
        }
        public ExtraValue(OrganizationExtra v, ExtraValueModel model)
        {
            Field = v.Field;
            StrValue = v.StrValue;
            DateValue = v.DateValue;
            Data = v.Data;
            IntValue = v.IntValue;
            BitValue = v.BitValue;
            Id = v.OrganizationId;
            Model = model;
        }
        public ExtraValue(MeetingExtra v, ExtraValueModel model)
        {
            Field = v.Field;
            Data = v.Data;
            Id = v.MeetingId;
            Model = model;
        }
    }
}