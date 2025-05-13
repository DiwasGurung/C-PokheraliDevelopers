using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokheraliDevelopers.Migrations
{
    /// <inheritdoc />
    public partial class updates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_AspNetUsers_CreatedById",
                table: "Announcements");

            migrationBuilder.DropIndex(
                name: "IX_Announcements_CreatedById",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Announcements");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedById",
                table: "Announcements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_CreatedById",
                table: "Announcements",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_AspNetUsers_CreatedById",
                table: "Announcements",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
