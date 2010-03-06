﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<CMSWeb.Models.SearchPersonModel>" %>
    <tr><td><label for="title">Title</label></td>
        <td><%=Html.DropDownList3(null, "m.list[" + Model.index + "].title", Model.TitleCodes(), Model.title) %></td>
        <td><%= Html.ValidationMessage("title") %></td>
    </tr>
    <tr>
        <td><label for="first">First Name</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].first" value="<%=Model.first%>" /></td>
        <td><%= Html.ValidationMessage("first") %>
        </td>
    </tr>
    <tr>
        <td><label for="goesby">Goes by</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].goesby" value="<%=Model.goesby%>" /></td>
        <td><%= Html.ValidationMessage("goesby") %></td>
    </tr>
    <tr>
        <td><label for="middle">Middle</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].middle" value="<%=Model.middle%>" /></td>
        <td><%= Html.ValidationMessage("middle") %></td>
    </tr>
    <tr>
        <td><label for="last">Last Name</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].last" value="<%=Model.last%>" /></td>
        <td><%= Html.ValidationMessage("last") %></td>
    </tr>
    <tr>
        <td><label for="suffix">Suffix</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].suffix" value="<%=Model.suffix%>" /></td>
        <td><%= Html.ValidationMessage("suffix")%></td>
    </tr>
     <tr>
        <td><label for="dob">Date of Birth</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].dob" value="<%=Model.dob%>" class="dob" title="m/d/y, mmddyy, mmddyyyy" /></td>
        <td><%= Html.ValidationMessage("dob") %></td>
    </tr>
    <tr>
        <td><label for="phone">Cell Phone</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].phone" value="<%=Model.phone%>" /></td>
        <td><%= Html.ValidationMessage("phone")%></td>
    </tr>
    <tr>
        <td><label for="email">Email</label></td>
        <td><input type="text" name="m.list[<%=Model.index%>].email" value="<%=Model.email%>" /></td>
        <td><%= Html.ValidationMessage("email")%></td>
    </tr>
    <tr><td><label for="gender">Gender</label></td>
        <td><%=Html.DropDownList3(null, "m.list[" + Model.index + "].gender", Model.GenderCodes(), Model.gender.ToString()) %></td>
        <td><%=Html.ValidationMessage("gender") %></td>
    </tr>
    <tr><td><label for="marital">Marital</label></td>
        <td><%=Html.DropDownList3(null, "m.list[" + Model.index + "].marital", Model.MaritalStatuses(), Model.marital.ToString()) %></td>
        <td><%=Html.ValidationMessage("marital") %></td>
    </tr>
