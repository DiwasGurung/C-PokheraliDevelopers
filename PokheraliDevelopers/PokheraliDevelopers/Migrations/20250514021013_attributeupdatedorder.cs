using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokheraliDevelopers.Migrations
{
    /// <inheritdoc />
    public partial class attributeupdatedorder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_ClaimCodeUsedByStaffId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "ClaimCodeUsedByStaffId",
                table: "Orders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_ClaimCodeUsedByStaffId",
                table: "Orders",
                column: "ClaimCodeUsedByStaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_ClaimCodeUsedByStaffId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "ClaimCodeUsedByStaffId",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_ClaimCodeUsedByStaffId",
                table: "Orders",
                column: "ClaimCodeUsedByStaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
