using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QueueUp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenServiceDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tokens_QueueId",
                table: "Tokens");

            migrationBuilder.AddColumn<DateOnly>(
                name: "ServiceDate",
                table: "Tokens",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.Sql(
    "UPDATE Tokens SET ServiceDate = CAST(SWITCHOFFSET(CreatedAt, '+05:30') AS date)");

            migrationBuilder.CreateIndex(
                name: "IX_Tokens_QueueId_ServiceDate_Number",
                table: "Tokens",
                columns: new[] { "QueueId", "ServiceDate", "Number" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tokens_QueueId_ServiceDate_Number",
                table: "Tokens");

            migrationBuilder.DropColumn(
                name: "ServiceDate",
                table: "Tokens");

            migrationBuilder.CreateIndex(
                name: "IX_Tokens_QueueId",
                table: "Tokens",
                column: "QueueId");
        }
    }
}
