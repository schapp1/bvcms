USE CMSEmailQueue
GO
SET NUMERIC_ROUNDABORT OFF
GO
SET ANSI_PADDING, ANSI_WARNINGS, CONCAT_NULL_YIELDS_NULL, ARITHABORT, QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
IF EXISTS (SELECT * FROM tempdb..sysobjects WHERE id=OBJECT_ID('tempdb..#tmpErrors')) DROP TABLE #tmpErrors
GO
CREATE TABLE #tmpErrors (Error int)
GO
SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
GO
BEGIN TRANSACTION
GO
PRINT N'Creating [dbo].[Databases]'
GO

CREATE VIEW [dbo].[Databases]
	AS
	SELECT name
	FROM sys.databases
	WHERE name LIKE 'CMS[_]%' AND name NOT LIKE 'CMS[_]%[_]img'


GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating [dbo].[CreateScheduledEmailAll]'
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[CreateScheduledEmailAll]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

declare @s varchar(max) = NULL 
	SELECT @s = 
		COALESCE(@s + CHAR(13) + CHAR(10) + 'UNION ALL ', '')
	+ 'SELECT Id, ''' + SUBSTRING(Name,5,LEN(Name)-4)
	+ ''' Host, (SELECT Setting FROM [' + name + '].dbo.Setting WHERE Id = ''DefaultHost'') CmsHost FROM [' + name + '].dbo.EmailQueue WHERE SendWhen IS NOT NULL AND Sent IS NULL AND DATEADD(Day, 0, DATEDIFF(Day, 0, SendWhen)) = DATEADD(Day, 0, DATEDIFF(Day, 0, GetDate()))'
	FROM databases
	ORDER BY name
	
	SELECT @s = 'ALTER VIEW [dbo].[ScheduledEmailAll]
	AS
	' + @s

	EXEC (@s)

END

GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating [dbo].[InsertMessage]'
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE InsertMessage(@msg VARCHAR(200))
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	DECLARE @dialog UNIQUEIDENTIFIER
	DECLARE @message NVARCHAR(50)
	BEGIN DIALOG CONVERSATION @dialog
	FROM SERVICE EmailSendService
	TO SERVICE 'EmailReceiveService'
	ON CONTRACT EmailContract
	WITH Encryption = OFF;
	
	SEND ON CONVERSATION @dialog
	MESSAGE TYPE EmailRequest (@msg)
	
END

GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating [dbo].[ScheduledEmailAll]'
GO
CREATE VIEW [dbo].[ScheduledEmailAll]
	AS
	SELECT 0 Id, '' Host, '' CmsHost
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating [dbo].[QueueScheduledEmails]'
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[QueueScheduledEmails]
AS
BEGIN

DECLARE @Id INT
DECLARE @Host VARCHAR(50)
DECLARE @CmsHost VARCHAR(50)
DECLARE @msg VARCHAR(200)

DECLARE c1 CURSOR READ_ONLY
FOR
SELECT Id, Host, CmsHost FROM dbo.ScheduledEmailAll

OPEN c1

FETCH NEXT FROM c1 INTO @Id, @Host, @CmsHost

WHILE @@FETCH_STATUS = 0
BEGIN

	
	SET @msg = CONVERT(VARCHAR(10), @id) + '|' + @CmsHost + '|' + @Host
	EXEC dbo.InsertMessage @msg

	FETCH NEXT FROM c1
	INTO @Id, @Host, @CmsHost

END

CLOSE c1
DEALLOCATE c1

END

GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating message types'
GO
CREATE MESSAGE TYPE [EmailRequest]
AUTHORIZATION [dbo]
VALIDATION=NONE
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating contracts'
GO
CREATE CONTRACT [EmailContract]
AUTHORIZATION [dbo] ( 
[EmailRequest] SENT BY INITIATOR
)
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating queues'
GO
CREATE QUEUE [dbo].[EmailSendQueue] 
WITH STATUS=ON, 
RETENTION=OFF
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
CREATE QUEUE [dbo].[EmailReceiveQueue] 
WITH STATUS=ON, 
RETENTION=OFF
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
PRINT N'Creating services'
GO
CREATE SERVICE [EmailReceiveService]
AUTHORIZATION [dbo]
ON QUEUE [dbo].[EmailReceiveQueue]
(
[EmailContract]
)
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
CREATE SERVICE [EmailSendService]
AUTHORIZATION [dbo]
ON QUEUE [dbo].[EmailSendQueue]
(
[EmailContract]
)
GO
IF @@ERROR<>0 AND @@TRANCOUNT>0 ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT=0 BEGIN INSERT INTO #tmpErrors (Error) SELECT 1 BEGIN TRANSACTION END
GO
IF EXISTS (SELECT * FROM #tmpErrors) ROLLBACK TRANSACTION
GO
IF @@TRANCOUNT>0 BEGIN
PRINT 'The database update succeeded'
COMMIT TRANSACTION
END
ELSE PRINT 'The database update failed'
GO
DROP TABLE #tmpErrors
GO
SET NUMERIC_ROUNDABORT OFF
GO
SET XACT_ABORT, ANSI_PADDING, ANSI_WARNINGS, CONCAT_NULL_YIELDS_NULL, ARITHABORT, QUOTED_IDENTIFIER, ANSI_NULLS, NOCOUNT ON
GO
SET DATEFORMAT YMD
GO
-- Pointer used for text / image updates. This might not be needed, but is declared here just in case
DECLARE @pv binary(16)

BEGIN TRANSACTION

COMMIT TRANSACTION
GO
EXEC dbo.CreateScheduledEmailAll
GO