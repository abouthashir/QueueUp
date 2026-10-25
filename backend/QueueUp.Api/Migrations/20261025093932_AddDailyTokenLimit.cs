using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QueueUp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyTokenLimit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DailyTokenLimit",
                table: "Queues",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Queues",
                keyColumn: "Id",
                keyValue: new Guid("c250ddb5-277c-4dd9-b1d6-e3b230bb69ac"),
                column: "DailyTokenLimit",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyTokenLimit",
                table: "Queues");
        }
    }
}
