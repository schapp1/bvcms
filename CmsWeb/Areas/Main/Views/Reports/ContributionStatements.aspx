﻿<%@ Page Title="" Language="C#" Inherits="System.Web.Mvc.ViewPage<CmsWeb.Areas.Main.Models.Report.ContributionStatementsExtract>" %>

<html>
<head>
    <title>Contribution Statements</title>
<% if (Model != null && Model.Running)
   { %>
    <script type="text/javascript">
        window.setTimeout('document.location.replace(document.location.href);', 5000);
    </script>
<% } %>
</head>
<body>
    <h2>
        Contribution Statements</h2>
        <a href="/">Home</a>
<% if (Model == null)
   { %>
    <form action="/Reports/ContributionStatements" method="post">
    <table>
        <tr> <th> PDF: </th> <td> <%=Html.CheckBox("PDF", true) %> (otherwise, text extract) </td> </tr>
        <tr> <th> Start Date: </th> <td> <%=Html.DatePicker("FromDate") %></td> </tr>
        <tr> <th> End Date: </th> <td> <%=Html.DatePicker("ToDate") %> </td></tr>
        <tr> <td colspan="2" align="center"> <%=Html.SubmitButton("Submit", "Run") %> </td></tr>
    </table>
    </form>
<% }  
   else if (Model.ExceptionOccurred != null)
   { %>
       <h3><%=Model.ExceptionOccurred.Message %></h3>
       <pre><%=Model.ExceptionOccurred.StackTrace %></pre>
    <form action="/Reports/ContributionStatements" method="post">
        <%=Html.SubmitButton("Submit", "Reset") %>
    </form>
<% }
   else
   { %>
    <table>
        <tr> <th colspan="2"> <%=Model.CurrentTask%> </th> </tr>
        <tr> <td> Total Contributors </td> <td> <%=Model.Count%> </td> </tr>
        <tr> <td> Processed </td> <td> <%=Model.Current%> </td> </tr>
        <tr> <td> Elapsed </td> <td> <%=DateTime.Now.Subtract(Model.LastStartTime).ToString("c")%> </td> </tr>
    </table>
    <% if (!Model.Running)
       { %>
       <a href="/Reports/ContributionStatementsDownload">Download Statement</a>
    <% }
   } %>
</html>
