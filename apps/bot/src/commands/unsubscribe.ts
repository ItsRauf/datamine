import { Drizzle, Schema, database } from "@datamine/database";
import { Command } from "@sapphire/framework";

export class SubscribeCommand extends Command {
  public constructor(
    context: Command.LoaderContext,
    options: Command.Options,
  ) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(
    registry: Command.Registry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("unsubscribe")
        .setDescription("Unsubscribe from the Datamine updates."),
    );
  }

  public async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    if (!interaction.inGuild()) return;
    if (!interaction.memberPermissions.has("ManageWebhooks")) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    try {
      await database
        .delete(Schema.servers)
        .where(
          Drizzle.eq(Schema.servers.id, BigInt(interaction.guildId)),
        );
    } catch (error) {
      return interaction.reply({
        content:
          "An error occurred while subscribing to Datamine updates.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content:
        "Datamine posts will no longer be posted in this server.",
      ephemeral: true,
    });
  }
}
