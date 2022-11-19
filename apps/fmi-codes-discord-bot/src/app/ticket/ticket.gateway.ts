import {Injectable, Logger} from '@nestjs/common';
import {InjectDiscordClient, On} from '@discord-nestjs/core';
import {
  Client,
  EmbedBuilder,
  ForumChannel,
  Message,
  MessageReaction,
  TextChannel,
  ThreadChannel,
  User
} from 'discord.js';
import {ChannelType} from "discord-api-types/v10";

@Injectable()
export class TicketGateway {
  private readonly logger = new Logger(TicketGateway.name);

  constructor(
    @InjectDiscordClient() private readonly client: Client,
  ) {
  }

  @On('threadCreate')
  async onMentorForumPost(thread: ThreadChannel) {
    // Get mentor channel from guild
    const mentorChannel = thread.guild.channels.cache.find(
      mentorChannel => mentorChannel.name === '❓︱въпроси' && mentorChannel.parent.name === '💡 Ментори 💡'
    ) as TextChannel

    if (thread.type == ChannelType.PublicThread && thread.parent.name === '❓︱въпроси-към-менторите') {
      let threadMessage: Message;

      // For large file uploads, starter message might take a few seconds to send
      // This loop ensures the message is processed whenever it is received
      // TODO: This is a dumb hack, somebody needs to fix this!
      while (!threadMessage) {
        try {
          threadMessage = await thread.fetchStarterMessage();
        } catch (DiscordAPIError) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // Get author and team discord objects
      const threadAuthor = await thread.guild.members.fetch(threadMessage.author);
      const threadPermissions = thread.parent.permissionOverwrites.cache;
      const threadRoles = threadPermissions.map(
        threadPermission => thread.guild.roles.cache.find(role => role.id === threadPermission.id)
      );
      const threadTeamRole = threadRoles.find((role) => role.name.includes("Отбор"));

      // Build an embed with the question information from the forum post
      const mentorMessageEmbed = new EmbedBuilder()
        .setTitle(thread.name)
        .setDescription(threadMessage.content)
        .setAuthor({
          name: threadAuthor.displayName,
          iconURL: threadMessage.author.avatarURL(),
        })
        .setFooter({
          text: thread.id,
        })

      // If there are image attachments, set the image to the
      const imageAttachments = threadMessage.attachments.filter(attachment => attachment.contentType.includes('image/'));
      if (imageAttachments.size !== 0) {
        mentorMessageEmbed.setImage(imageAttachments.at(0).url)
      }

      // Get names of all tags applied to the forum post
      const appliedTagNames = thread.appliedTags.map(
        (appliedTag) => (thread.parent as ForumChannel).availableTags.find(
          (availableTag) => availableTag.id === appliedTag
        ).name
      );

      // Create a list of technology roles from the applied tags
      const technologyRoles = appliedTagNames.map(
        (appliedTagName) => thread.guild.roles.cache.find(
          (role) => role.name === appliedTagName
        )
      );

      // Send question to mentor channel
      const mentorMessage = await mentorChannel.send({
        content: `❓️ Въпрос от <@&${threadTeamRole.id}>\n`
          .concat(...technologyRoles.map(technologyRole => ` <@&${technologyRole.id}>`)),
        embeds: [mentorMessageEmbed],
      })

      // Add ticket reaction to the message
      await mentorMessage.react("🎟️")

      // Send a message to the thread, notifying that the question has been sent to the mentor channel
      await thread.send({
        content: 'Въпросът е изпратен към менторите. 🎟️',
      });
    }
  }

  @On('messageReactionAdd')
  async onMessageReactionAdd(messageReaction: MessageReaction, user: User) {
    // Get the message the reaction was added to
    const message = await messageReaction.message.fetch();
    const messageChannel = message.channel as TextChannel;
    const guildMember = await message.guild.members.fetch(user);

    if (messageChannel.name === '❓︱въпроси' && messageChannel.parent.name === '💡 Ментори 💡') {
      const teamRole = await message.mentions.roles.find((role) => role.name.includes("Отбор"));
      const questionPostId = message.embeds[0].footer.text;
      const questionPost = await message.guild.channels.fetch(questionPostId) as ThreadChannel;
      const organizerRole = await message.guild.roles.cache.find(role => role.name === 'Организатор');

      if (messageReaction.emoji.name === '🎟️' && messageReaction.count >= 2) {
        // Give the mentor access to the team channels
        await guildMember.roles.add(teamRole);

        // Replace ticket reaction with a checkmark reactions
        await message.reactions.removeAll();
        await message.react("✅")
        await message.react("❎")

        // Send a message to the team channel
        await questionPost.send(`<@&${teamRole.id}>, <@${guildMember.id}> се зае с вашия въпрос! 🎟️`)
      }

      if (
        messageReaction.emoji.name === '✅' &&
        (guildMember.roles.cache.has(teamRole.id) || guildMember.roles.cache.has(organizerRole.id))
      ) {
        // Remove the checkmark reactions
        await message.reactions.removeAll();

        // Remove the mentor from the team channels
        await guildMember.roles.remove(teamRole);

        // Send a message to the team channel
        await questionPost.send(`<@&${teamRole.id}>, <@${guildMember.id}> маркира въпроса ви като отговорен!️ ✅`);

        // Close the thread
        await questionPost.setArchived(true);

        // Edit the message content
        await message.edit({
          content: `${message.content}\n ✅ Отговорен`,
        })
      }

      if (
        messageReaction.emoji.name === '❎' &&
        (guildMember.roles.cache.has(teamRole.id) || guildMember.roles.cache.has(organizerRole.id))
      ) {
        // Remove the mentor from the team channels
        await guildMember.roles.remove(teamRole);

        // Replace checkmark reaction with a ticket reaction
        await message.reactions.removeAll();
        await message.react("🎟️")

        // Send a message to the team channel
        await questionPost.send(`<@&${teamRole.id}>, <@${guildMember.id}> повторно ️отвири въпроса ви! 🎟️`);
      }
    }
  }
}
