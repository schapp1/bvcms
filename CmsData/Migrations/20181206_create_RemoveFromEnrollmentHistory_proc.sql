SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
DROP PROCEDURE IF EXISTS [dbo].[RemoveFromEnrollmentHistory]
GO
CREATE PROCEDURE [dbo].[RemoveFromEnrollmentHistory](@OrganizationId INT, @PeopleId INT)
AS
BEGIN		
	DELETE FROM dbo.EnrollmentTransaction
	WHERE OrganizationId = @OrganizationId AND PeopleId = @PeopleId
END
GO
