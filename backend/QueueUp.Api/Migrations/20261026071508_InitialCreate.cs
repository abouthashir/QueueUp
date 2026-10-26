using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QueueUp.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Businesses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    OpeningHours = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Businesses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Queues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Prefix = table.Column<char>(type: "character(1)", nullable: false),
                    AverageServiceMinutes = table.Column<int>(type: "integer", nullable: false),
                    DailyTokenLimit = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Queues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Queues_Businesses_BusinessId",
                        column: x => x.BusinessId,
                        principalTable: "Businesses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CounterName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Businesses_BusinessId",
                        column: x => x.BusinessId,
                        principalTable: "Businesses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QueueId = table.Column<Guid>(type: "uuid", nullable: false),
                    Prefix = table.Column<char>(type: "character(1)", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CounterName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ServiceDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tokens_Queues_QueueId",
                        column: x => x.QueueId,
                        principalTable: "Queues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Businesses",
                columns: new[] { "Id", "Address", "Name", "OpeningHours", "Type" },
                values: new object[] { new Guid("5e0b6a3c-8d2f-4c71-9a4e-0f3d2b1c7e65"), "", "Demo Clinic", "", "Other" });

            migrationBuilder.InsertData(
                table: "Queues",
                columns: new[] { "Id", "AverageServiceMinutes", "BusinessId", "DailyTokenLimit", "Name", "Prefix", "Status" },
                values: new object[] { new Guid("c250ddb5-277c-4dd9-b1d6-e3b230bb69ac"), 5, new Guid("5e0b6a3c-8d2f-4c71-9a4e-0f3d2b1c7e65"), null, "General OPD", 'A', "Open" });

            migrationBuilder.CreateIndex(
                name: "IX_Queues_BusinessId",
                table: "Queues",
                column: "BusinessId");

            migrationBuilder.CreateIndex(
                name: "IX_Tokens_QueueId_ServiceDate_Number",
                table: "Tokens",
                columns: new[] { "QueueId", "ServiceDate", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_BusinessId",
                table: "Users",
                column: "BusinessId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tokens");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Queues");

            migrationBuilder.DropTable(
                name: "Businesses");
        }
    }
}
