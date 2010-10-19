﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<CmsWeb.Models.OnlineRegPersonModel2>" %>
<%Html.RenderPartial("PersonHidden", Model); %>
<table cellspacing="0">
    <tr>
        <td><label for="first">First Name</label></td>
        <td><%=Model.first %></td>
    </tr>
    <tr>
        <td><label for="last">Last Name</label></td>
        <td><%=Model.last %> <%= Html.ValidationMessage("find") %></td>
    </tr>
     <tr>
        <td><label for="dob">Date of Birth</label></td>
        <td><%=Model.birthday.FormatDate("not given") %> <span><%=Model.age %></span>
        <%= Html.ValidationMessage("dob") %></td>
    </tr>
    <tr>
        <td><label for="phone">Phone</label></td>
        <td><%=Model.phone.FmtFone() %></td>
    </tr>
    <% if (Model.email.HasValue())
       { %>
    <tr>
        <td><label for="email">Contact Email</label></td>
        <td><%=Model.email %></td>
    </tr>
    <% }
       if (Model.ShowAddress)
       {
           Html.RenderPartial("AddressDisplay", Model);
       } %>
</table>
