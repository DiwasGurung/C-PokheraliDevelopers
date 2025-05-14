using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokheraliDevelopers.Migrations
{
    /// <inheritdoc />
    public partial class tableupdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BgColor",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TextColor",
                table: "Announcements");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BgColor",
                table: "Announcements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TextColor",
                table: "Announcements",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
