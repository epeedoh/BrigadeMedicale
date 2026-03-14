using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrigadeMedicale.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTriageFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TriageRecordId",
                table: "Consultations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TriageRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PatientId = table.Column<Guid>(type: "TEXT", nullable: false),
                    InfirmierId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Temperature = table.Column<decimal>(type: "TEXT", nullable: false),
                    Pulse = table.Column<int>(type: "INTEGER", nullable: false),
                    SystolicBP = table.Column<int>(type: "INTEGER", nullable: false),
                    DiastolicBP = table.Column<int>(type: "INTEGER", nullable: false),
                    Weight = table.Column<decimal>(type: "TEXT", nullable: false),
                    Height = table.Column<decimal>(type: "TEXT", nullable: false),
                    SpO2 = table.Column<int>(type: "INTEGER", nullable: true),
                    RespiratoryRate = table.Column<int>(type: "INTEGER", nullable: true),
                    Complaint = table.Column<string>(type: "TEXT", nullable: false),
                    UrgencyLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ConsultationId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriageRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TriageRecords_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TriageRecords_Users_InfirmierId",
                        column: x => x.InfirmierId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Infirmier", "INFIRMIER" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Médecin", "MEDECIN" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Technicien de laboratoire", "LABORANTIN" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Pharmacien", "PHARMACIEN" });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[] { 7, "Superviseur", "SUPERVISEUR" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_TriageRecordId",
                table: "Consultations",
                column: "TriageRecordId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TriageRecords_InfirmierId",
                table: "TriageRecords",
                column: "InfirmierId");

            migrationBuilder.CreateIndex(
                name: "IX_TriageRecords_PatientId",
                table: "TriageRecords",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_TriageRecords_RecordedAt",
                table: "TriageRecords",
                column: "RecordedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TriageRecords_Status",
                table: "TriageRecords",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_TriageRecords_TriageRecordId",
                table: "Consultations",
                column: "TriageRecordId",
                principalTable: "TriageRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_TriageRecords_TriageRecordId",
                table: "Consultations");

            migrationBuilder.DropTable(
                name: "TriageRecords");

            migrationBuilder.DropIndex(
                name: "IX_Consultations_TriageRecordId",
                table: "Consultations");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DropColumn(
                name: "TriageRecordId",
                table: "Consultations");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Médecin", "MEDECIN" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Technicien de laboratoire", "LABORANTIN" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Pharmacien", "PHARMACIEN" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Superviseur", "SUPERVISEUR" });
        }
    }
}
