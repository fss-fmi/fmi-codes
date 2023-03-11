import { Injectable } from '@nestjs/common';
import { PgService } from '../database/pg.service';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client, Guild, Role } from 'discord.js';
import { ChannelType } from 'discord-api-types/v10';
import environment from '../environments/environment';
import { PrismaService } from '../database/prisma.service';

interface Team {
  id: number;
  name: string;
}

@Injectable()
export class TeamService {
  constructor(
    private readonly pg: PgService,
    private readonly prisma: PrismaService,
    @InjectDiscordClient() private readonly client: Client
  ) {
    // Subscribe to database team added event
    pg.client.query('LISTEN team_added');
    pg.client.on('notification', async (msg) => {
      if (msg.channel !== 'team_added') return;

      const team = JSON.parse(msg.payload);
      const guild = this.client.guilds.cache.get(environment().discord.guildId);

      // Check if team role and channels already exist
      const role =
        guild.roles.cache.find((role) => role.name === `Отбор ${team.name}`) ??
        (await this.createTeamRole(guild, team));

      const teamCategory = guild.channels.cache.find(
        (channel) => channel.name === `✨ ${team.name} ✨`
      );

      if (!teamCategory) {
        await this.createTeamChannels(guild, team, role);
      }
    });
  }

  async createTeamRole(guild: Guild, team: Team): Promise<Role> {
    // Create team role
    return await guild.roles.create({
      name: `Отбор ${team.name}`,
      color: '#607D8B',
      reason: 'Team role',
    });
  }

  async createTeamChannels(guild: Guild, team: Team, role: Role) {
    // Create channel category
    const category = await guild.channels.create({
      name: `✨ ${team.name} ✨`,
      type: ChannelType.GuildCategory,
    });

    // Create team text channel
    const textChannel = await guild.channels.create({
      name: `💬︱отбор-${team.name}`,
      topic: `Канал за комуникация между участниците на отбор ${team.name}`,
      type: ChannelType.GuildText,
      parent: category.id,
    });

    const technologies = await this.prisma.technology.findMany({
      select: { name: true },
      take: 20,
    });

    // Create team mentor questions channel
    const questionsChannel = await guild.channels.create({
      name: `❓︱въпроси-към-менторите`,
      topic: `Канал за въпроси на отбор ${team.name} към менторите`,
      // availableTags: technologies.map((t) => ({ name: t.name.slice(0, 19) })),
      type: ChannelType.GuildForum,
      parent: category.id,
    });

    // Create team voice channel
    const voiceChannel = await guild.channels.create({
      name: `🔊︱отбор-${team.name}`,
      topic: `Канал за гласова комуникация между участниците на отбор ${team.name}`,
      type: ChannelType.GuildVoice,
      parent: category.id,
    });

    // Set channels to be visible only to team members
    const everyone = guild.roles.cache.find(
      (role) => role.name === '@everyone'
    );

    await category.permissionOverwrites.create(everyone, {
      ViewChannel: false,
    });

    await category.permissionOverwrites.create(role, {
      ViewChannel: true,
    });

    return { category, textChannel, questionsChannel, voiceChannel };
  }
}
