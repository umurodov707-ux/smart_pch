/**
 * SCHEMA MANAGER
 * Defines the database schema and handles initialization/migrations
 * for both SQLite and PostgreSQL.
 */

const schema = [
    // Users
    {
        name: 'users',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS users (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            full_name TEXT,
            departments TEXT,
            bolinmalar TEXT,
            employee_id INTEGER,
            avatar TEXT,
            phone TEXT,
            settings TEXT,
            status TEXT DEFAULT 'active'
        )`
    },
    // Reports
    {
        name: 'reports',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS reports (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            user_id INTEGER,
            bolinma_id TEXT,
            content TEXT,
            structuredData TEXT,
            date TEXT,
            time TEXT,
            status TEXT DEFAULT 'received'
        )`
    },
    // OKNO Planning
    {
        name: 'okno_planning',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS okno_planning (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            title TEXT NOT NULL,
            type TEXT,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            km TEXT,
            pk TEXT,
            resources TEXT,
            status TEXT DEFAULT 'pending',
            bolinma_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Sand Analysis
    {
        name: 'sand_analysis_reports',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS sand_analysis_reports (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            location_name TEXT,
            km_start TEXT,
            km_end TEXT,
            risk_level INTEGER,
            wind_speed REAL,
            analysis_data TEXT,
            bolinma_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Infrastructure Status
    {
        name: 'infrastructure_status',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS infrastructure_status (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            name TEXT NOT NULL,
            type TEXT,
            bolinma_id TEXT,
            status TEXT DEFAULT 'open',
            details TEXT,
            geometry TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Digital Warnings
    {
        name: 'digital_warnings',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS digital_warnings (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            title TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'temporary',
            priority TEXT DEFAULT 'normal',
            speed_limit INTEGER,
            km TEXT,
            pk TEXT,
            start_date TEXT,
            end_date TEXT,
            bolinma_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Defectoscope Carts
    {
        name: 'defectoscope_carts',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS defectoscope_carts (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            cart_id TEXT UNIQUE,
            operator TEXT,
            start_km INTEGER,
            end_km INTEGER,
            current_km INTEGER,
            status TEXT DEFAULT 'inactive',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'defects',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS defects (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            km INTEGER,
            pk INTEGER,
            degree INTEGER,
            issue TEXT,
            description TEXT,
            is_repeated INTEGER DEFAULT 0,
            date TEXT,
            status TEXT DEFAULT 'active'
        )`
    },
    // Infrastructure Assets
    {
        name: 'infrastructure_assets',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS infrastructure_assets (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            name TEXT NOT NULL,
            asset_type TEXT,
            specification TEXT,
            install_date TEXT,
            last_repair_date TEXT,
            next_repair_date TEXT,
            km TEXT,
            pk TEXT,
            bolinma_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // PU-29 Records
    {
        name: 'pu29_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu29_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            date TEXT,
            station TEXT,
            switch_number TEXT,
            type TEXT,
            marka TEXT,
            promers TEXT,
            npk TEXT,
            wear TEXT,
            strelka_points TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // PU-29 Pages (to sync switch lists per bolinma)
    {
        name: 'pu29_pages',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu29_pages (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            switch_number TEXT,
            UNIQUE(bolinma_id, switch_number)
        )`
    },
    // PU-28 Records (Section 1)
    {
        name: 'pu28_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu28_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            date TEXT,
            check_method TEXT,
            km INTEGER,
            pk INTEGER,
            zv INTEGER,
            defect_desc TEXT,
            resolved_status TEXT DEFAULT 'pending',
            date_resolved TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // PU-28 Section 2 Records (Defektiv Relsslar va Nakladkalar Jurnali)
    {
        name: 'pu28_section2_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu28_section2_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            date_detected TEXT,
            track_no TEXT,
            km INTEGER,
            pk INTEGER,
            zveno INTEGER,
            thread_side TEXT,
            factory_mark TEXT,
            rolling_year TEXT,
            heat_no TEXT,
            rail_type TEXT,
            defect_code TEXT,
            defect_desc TEXT,
            replacement_deadline TEXT,
            defective_fishplates TEXT,
            date_replaced TEXT,
            resolved_status TEXT DEFAULT 'pending',
            defect_photo TEXT,
            work_photo TEXT,
            face_photo TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Material Acts (M-29)
    {
        name: 'material_acts',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS material_acts (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            dept_id TEXT,
            date TEXT,
            station TEXT,
            bolinma_num TEXT,
            master TEXT,
            brigadier1 TEXT,
            brigadier2 TEXT,
            year TEXT,
            day_month TEXT,
            dept_name TEXT,
            location_start TEXT,
            km TEXT,
            pk TEXT,
            misc_loc TEXT,
            work_desc TEXT,
            method TEXT,
            materials_summary TEXT,
            status TEXT DEFAULT 'pending',
            approved_date TEXT,
            approved_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Act Items
    {
        name: 'act_items',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS act_items (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            act_id INTEGER,
            item_name TEXT,
            qty REAL,
            uom TEXT,
            FOREIGN KEY(act_id) REFERENCES material_acts(id)
        )`
    },
    // Storage Items (Warehouse)
    {
        name: 'storage_items',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS storage_items (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            schyot TEXT,
            name TEXT UNIQUE,
            uom TEXT,
            price REAL,
            quantity REAL DEFAULT 0,
            bolinma_id TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Marketplace Items
    {
        name: 'marketplace_items',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS marketplace_items (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            type TEXT, -- 'surplus' or 'needed'
            material_name TEXT,
            qty REAL,
            uom TEXT,
            contact TEXT,
            bolinma_id TEXT,
            date TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Timesheet Records (Tabel)
    {
        name: 'timesheet_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS timesheet_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            year INTEGER,
            month INTEGER,
            employee_id INTEGER,
            data TEXT, -- JSON string of daily hours
            status TEXT DEFAULT 'draft',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(bolinma_id, year, month)
        )`
    },
    // PU-74 Granular Data (Work Acts)
    {
        name: 'pu74_data',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu74_data (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            date TEXT,
            act_number TEXT,
            location_name TEXT,
            km TEXT,
            pk TEXT,
            work_type TEXT,
            bridge_id TEXT,
            details TEXT, -- JSON string for additional act fields
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // PU-74 Monthly Documents (E-Imzo storage)
    {
        name: 'pu74_monthly_documents',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu74_monthly_documents (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            year_month TEXT,
            document_data TEXT,
            status TEXT DEFAULT 'draft',
            signed_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(bolinma_id, year_month)
        )`
    },
    // Audit Logs
    {
        name: 'audit_logs',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS audit_logs (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            user_id INTEGER,
            username TEXT,
            action TEXT,
            entity TEXT,
            entity_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Files
    {
        name: 'files',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS files (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            filename TEXT NOT NULL,
            original_name TEXT,
            file_path TEXT,
            file_type TEXT,
            file_size INTEGER,
            module TEXT,
            bolinma_id TEXT,
            uploaded_by INTEGER,
            status TEXT DEFAULT 'pending',
            approved_by INTEGER,
            approved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Key-Value Storage (kv_storage)
    {
        name: 'kv_storage',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS kv_storage (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Department Tools (Inventory for PU-80)
    {
        name: 'department_tools',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS department_tools (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            tool_name TEXT NOT NULL,
            tool_number TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // PU-80 Records (Checkout/Return)
    {
        name: 'pu80_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pu80_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            dept_id TEXT,
            tool_name TEXT,
            tool_number TEXT,
            responsible TEXT,
            taken_time TIMESTAMP,
            return_time TIMESTAMP,
            status TEXT DEFAULT 'active',
            verification_type TEXT,
            face_take TEXT,
            sign_take TEXT,
            face_return TEXT,
            sign_return TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Employees (Centralized)
    {
        name: 'employees',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS employees (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            full_name TEXT NOT NULL,
            department_id TEXT,
            bolinma_id TEXT,
            position TEXT,
            rank TEXT,
            birth_date TEXT,
            phone TEXT,
            hired_date TEXT,
            medical_checkup_date TEXT,
            last_training_date TEXT,
            vacation_start_date TEXT,
            vacation_end_date TEXT,
            tabel_number TEXT,
            face_template TEXT,
            status TEXT DEFAULT 'active',
            obektivka TEXT,
            relatives TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Murojaat (HR/Reporting Appeals)
    {
        name: 'murojaat',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS murojaat (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            employee_id INTEGER,
            employee_name TEXT,
            employee_position TEXT,
            bolinma_id TEXT,
            murojaat_type TEXT,
            murojaat_text TEXT,
            signature_data TEXT,
            face_verified INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            manager_name TEXT,
            manager_comment TEXT,
            approved_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // TNU-19 Safety Records
    {
        name: 'tnu19_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS tnu19_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            employee_id INTEGER,
            bolinma_id TEXT,
            date TEXT,
            time TEXT,
            instruction_type TEXT,
            instructor_name TEXT,
            signature TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // TNU-20 Safety Records
    {
        name: 'tnu20_records',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS tnu20_records (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            employee_id INTEGER,
            bolinma_id TEXT,
            date TEXT,
            next_test_date TEXT,
            certificate_no TEXT,
            result TEXT,
            signature TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Document Workflow
    {
        name: 'document_workflow',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS document_workflow (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            doc_type TEXT NOT NULL,
            doc_id INTEGER NOT NULL,
            workflow_path TEXT,
            current_step_index INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            history TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(doc_type, doc_id)
        )`
    },
    // Broadcast Messages
    {
        name: 'broadcast_messages',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS broadcast_messages (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            sender_id INTEGER,
            sender_name TEXT,
            title TEXT,
            message TEXT,
            priority TEXT DEFAULT 'normal',
            target TEXT DEFAULT 'all',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Tasks List
    {
        name: 'tasks',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS tasks (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            user_id INTEGER,
            title TEXT,
            deadline TEXT,
            status TEXT DEFAULT 'todo',
            is_urgent INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Vehicles (Mechanics)
    {
        name: 'vehicles',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS vehicles (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            name TEXT NOT NULL,
            number TEXT,
            garage_number TEXT,
            fuel_type TEXT,
            fuel_norm REAL,
            start_fuel REAL,
            start_speedometer REAL,
            bolinma_id TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Waybills (Putyovka)
    {
        name: 'waybills',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS waybills (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            vehicle_id INTEGER,
            driver_id INTEGER,
            date TEXT,
            start_time TEXT,
            end_time TEXT,
            start_km REAL,
            end_km REAL,
            fuel_filled REAL,
            fuel_end REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Repair Logs
    {
        name: 'repair_logs',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS repair_logs (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            vehicle_id INTEGER,
            date TEXT,
            description TEXT,
            parts_replaced TEXT,
            total_cost REAL,
            mechanic_name TEXT,
            status TEXT DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Mechanic Parts (Warehouse)
    {
        name: 'mechanic_parts',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS mechanic_parts (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            name TEXT NOT NULL,
            part_number TEXT,
            quantity REAL DEFAULT 0,
            unit TEXT,
            min_limit REAL,
            price REAL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Technical Maintenance
    {
        name: 'technical_maintenance',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS technical_maintenance (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            vehicle_id INTEGER,
            to_type TEXT,
            date TEXT,
            inspector TEXT,
            notes TEXT,
            status TEXT DEFAULT 'completed',
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Vehicle Orders
    {
        name: 'vehicle_orders',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS vehicle_orders (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            vehicle_id INTEGER,
            vehicle_name TEXT,
            task TEXT,
            dept_name TEXT,
            date TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Metrology Electricity
    {
        name: 'metrology_electricity',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS metrology_electricity (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            lastReading REAL,
            currentMonth REAL,
            date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(bolinma_id, date)
        )`
    },
    // Metrology Devices
    {
        name: 'metrology_devices',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS metrology_devices (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            name TEXT NOT NULL,
            serial TEXT,
            stampDate TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Accounting Archives (Historical Reports)
    {
        name: 'accounting_archives',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS accounting_archives (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            filename TEXT,
            period TEXT,
            summary TEXT,
            data TEXT, -- JSON string of the full report items
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Safety Logs (General jurnallar)
    {
        name: 'safety_logs',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS safety_logs (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            type TEXT, -- e.g., 'instruction', 'test', 'check'
            employee_id INTEGER,
            content TEXT,
            date TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Maintenance Logs (Texnik xizmat jurnali)
    {
        name: 'maintenance_logs',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS maintenance_logs (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            category TEXT,
            title TEXT,
            content TEXT,
            date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Technical Training (Texnik o'quv)
    {
        name: 'technical_training',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS technical_training (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            topic TEXT,
            date TEXT,
            hours INTEGER,
            instructor_name TEXT,
            instructor_signature TEXT,
            attendees TEXT, -- JSON string of attendees with their signatures
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Izostiklar Monitoring (Isolated Joints)
    {
        name: 'izostiklar',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS izostiklar (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            group_name TEXT,
            num TEXT,
            type TEXT DEFAULT 'R-65',
            location TEXT,
            km INTEGER,
            last_date TEXT,
            performer TEXT,
            bolinma_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // Pletlar Hisobi (Long Rail Records)
    {
        name: 'plets_advanced',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS plets_advanced (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            plet_number TEXT,
            start_km INTEGER,
            start_pk INTEGER,
            end_km INTEGER,
            end_pk INTEGER,
            length REAL,
            install_date TEXT,
            neutral_temp TEXT,
            buffer_rails TEXT,
            status TEXT DEFAULT 'ME''YORDA',
            history TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    // PKZ Relslar Hisobi (Reserve Rail Accounting)
    {
        name: 'pkz_rails',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS pkz_rails (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            bolinma_id TEXT,
            km INTEGER,
            pk INTEGER,
            side TEXT,
            rail_type TEXT DEFAULT 'R-65',
            length REAL,
            quantity INTEGER DEFAULT 1,
            status TEXT DEFAULT 'yangi',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    },
    {
        name: 'plet_history',
        sql: (isPg) => `CREATE TABLE IF NOT EXISTS plet_history (
            id ${isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
            plet_id INTEGER REFERENCES plets_advanced(id) ON DELETE CASCADE,
            temp NUMERIC,
            status VARCHAR(50),
            recorded_at ${isPg ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
        )`
    }
];

async function initSchema(db) {
    const isPg = db.isPostgres;
    for (const table of schema) {
        try {
            await db.exec(table.sql(isPg));
            // console.log(`Table initialized: ${table.name}`);
        } catch (err) {
            console.error(`Error creating table ${table.name}:`, err.message);
        }
    }

    // Add Column helper - safely handled to ignore duplicate/already exists column errors
    const addColumn = async (table, col, type) => {
        try {
            await db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
        } catch (err) {
            const msg = String(err.message).toLowerCase();
            if (!msg.includes('duplicate') && !msg.includes('already exists') && !msg.includes('already exist')) {
                console.warn(`[Migration] Warning adding ${col} to ${table}:`, err.message);
            }
        }
    };

    if (!isPg) {
        await addColumn('metrology_electricity', 'month_year', 'TEXT');
        await addColumn('metrology_electricity', 'status', 'TEXT');
        await addColumn('metrology_electricity', 'rejection_reason', 'TEXT');
        await addColumn('metrology_electricity', 'is_final', 'INTEGER');
        
        await addColumn('defects', 'km', 'INTEGER');
        await addColumn('defects', 'degree', 'INTEGER');
        await addColumn('defects', 'description', 'TEXT');
        await addColumn('defects', 'is_repeated', 'INTEGER DEFAULT 0');
    }

    await addColumn('employees', 'obektivka', 'TEXT');
    await addColumn('employees', 'relatives', 'TEXT');
    await addColumn('metrology_devices', 'birkaDate', 'TEXT');
    await addColumn('murojaat', 'attachment_data', 'TEXT');
    await addColumn('murojaat', 'code', 'TEXT');
    await addColumn('izostiklar', 'history', 'TEXT');

    // Auto-seed infrastructure_assets if empty
    try {
        db.get("SELECT COUNT(*) as count FROM infrastructure_assets", [], async (err, row) => {
            if (!err && row && row.count === 0) {
                console.log("Seeding initial infrastructure assets...");
                const initialData = [
                    { type: 'bridge', name: 'Zeravshan daryosi kôprigi', km: '4022.5', bolinma_id: 'bolinma1', specification: '120m', install_date: '2020-01-01' },
                    { type: 'culvert', name: 'Temir-beton truba (d=1.5m)', km: '4035.8', bolinma_id: 'bolinma1', specification: '12m', install_date: '2020-01-01' },
                    { type: 'pedestrian_bridge', name: 'Piyodalar kôprigi', km: '4056.2', bolinma_id: 'bolinma2', specification: '45m', install_date: '2020-01-01' },
                    { type: 'tunnel', name: 'Qorlitog\' tonneli', km: '4120.4', bolinma_id: 'bolinma4', specification: '1200m', install_date: '2020-01-01' }
                ];
                for (const item of initialData) {
                    db.run(
                        `INSERT INTO infrastructure_assets (name, asset_type, km, bolinma_id, specification, install_date) VALUES (?, ?, ?, ?, ?, ?)`,
                        [item.name, item.type, item.km, item.bolinma_id, item.specification, item.install_date]
                    );
                }
            }
        });
    } catch (e) {
        console.error("Auto-seed error:", e.message);
    }
}

module.exports = { initSchema };
