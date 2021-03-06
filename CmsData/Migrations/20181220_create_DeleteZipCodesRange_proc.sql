DROP PROCEDURE IF EXISTS [dbo].[DeleteZipCodesRange]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[DeleteZipCodesRange](@StartWith INT, @EndWith INT)
AS
BEGIN
	DECLARE @TotalZipRemoved INT = 0;	
	
	DECLARE @zipsToRemove TABLE (
			ZipCode NVARCHAR(10) NOT NULL);

	WHILE (@StartWith <= @EndWith)
	BEGIN
		IF EXISTS(SELECT 1 FROM dbo.Zips WHERE ZipCode = @StartWith)
		BEGIN 
			INSERT INTO @zipsToRemove (ZipCode)
			VALUES (dbo.CompleteZip(@StartWith));
			SET @TotalZipRemoved = @TotalZipRemoved + 1;		
		END
        		 
		SET @StartWith = @StartWith + 1;		
	END

	DELETE z
	FROM dbo.Zips z
	INNER JOIN @zipsToRemove zr
	ON z.ZipCode = zr.ZipCode	
	
	RETURN @TotalZipRemoved;
END
GO
