module.exports = {
    apps: [
        {
            name: 'smart-pch-server',
            script: './server/index.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            autorestart: true,
            restart_delay: 3000,
            max_restarts: 15,
            max_memory_restart: '1G',
            exp_backoff_restart_delay: 100,
            env: {
                NODE_ENV: 'development',
                PORT: 7007
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 6878
            },
            error_file: './server/logs/err.log',
            out_file: './server/logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true,
            // Log fayllarini 10MB dan oshirmaslik
            max_size: '10M',
            // Eski loglarni 5 ta saqlash
            retain: 5
        },
        {
            name: 'zk-bridge',
            script: './zk-bridge.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            autorestart: true,
            restart_delay: 3000,
            max_restarts: 10,
            exp_backoff_restart_delay: 100,
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            },
            error_file: './server/logs/bridge-err.log',
            out_file: './server/logs/bridge-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        }
    ]
};
