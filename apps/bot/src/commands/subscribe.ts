import { database, Schema } from "@datamine/database";
import { Command } from "@sapphire/framework";
import { ChannelType } from "discord.js";

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
        .setName("subscribe")
        .setDescription("Subscribe to the Datamine updates.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to send updates to.")
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to send updates to."),
        ),
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

    const channel = interaction.options.getChannel("channel", false, [
      ChannelType.GuildText,
    ]);
    const role = interaction.options.getRole("role");

    const data = {
      channel: channel
        ? BigInt(channel.id)
        : BigInt(interaction.channelId),
      role: role ? BigInt(role.id) : undefined,
    };

    try {
      await database
        .insert(Schema.servers)
        .values({
          id: BigInt(interaction.guildId),
          ...data,
        })
        .onConflictDoUpdate({
          target: Schema.servers.id,
          set: data,
        });
    } catch (error) {
      return interaction.reply({
        content:
          "An error occurred while subscribing to Datamine updates.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `Datamine posts will now be posted into <#${
        data.channel
      }> ${data.role ? `and mention <@&${data.role}>` : ""}.`,
      ephemeral: true,
    });
  }
}
