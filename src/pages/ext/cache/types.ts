export type CacheInfo = {
    redis_version?: string;
    connected_clients?: string | number;
    uptime_in_days?: string | number;
    used_memory?: string | number;
    used_memory_human?: string;
    aof_enabled?: string | number;
    rdb_last_bgsave_status?: string;
};

export type CacheCommandStat = {
    name: string;
    value: number;
};

export type CacheResponse = {
    info: CacheInfo;
    dbSize: number;
    commandStats: CacheCommandStat[];
};
