const db = require('../config/db');

exports.dashboard = async (req, res) => {
    try {
        const [pendingDonations] = await db.query(
            `SELECT COUNT(*) as count FROM DONATIONS WHERE status = 'pending'`
        );

        const [todayDeliveries] = await db.query(`
            SELECT COUNT(*) as count 
            FROM DONATION_ASSIGNMENTS 
            WHERE DATE(scheduled_delivery_date) = CURDATE()
        `);

        const [activeVolunteers] = await db.query(
            `SELECT COUNT(*) as count FROM VOLUNTEERS 
             WHERE status = 'active'`
        );

        const [notifications] = await db.query(
            `SELECT COUNT(*) as count FROM NOTIFICATIONS 
             WHERE is_read = FALSE`
        );

        const [distributionData] = await db.query(
            `SELECT 
                MONTH(donation_date) as month,
                SUM(quantity) as delivered
             FROM DONATIONS
             WHERE YEAR(donation_date) = YEAR(CURDATE())
             GROUP BY MONTH(donation_date)
             ORDER BY month`
        );

        const [donationSources] = await db.query(
            `SELECT 
                WEEK(d.donation_date) as week,
                don.type as source_type,
                COUNT(*) as count
             FROM DONATIONS d
             JOIN DONORS don ON d.donor_id = don.donor_id
             WHERE YEAR(d.donation_date) = YEAR(CURDATE())
             GROUP BY WEEK(d.donation_date), don.type
             ORDER BY week`
        );

        const [urgentNotifications] = await db.query(
            `SELECT 
                n.notification_id,
                n.message,
                n.is_read,
                n.created_at,
                u.role as user_type
             FROM NOTIFICATIONS n
             LEFT JOIN USERS u ON n.user_id = u.user_id
             WHERE n.is_read = FALSE
             ORDER BY n.created_at DESC
             LIMIT 5`
        );

        res.json({
            stats: {
                pendingDonations: pendingDonations[0].count,
                todayDeliveries: todayDeliveries[0].count,
                activeVolunteers: activeVolunteers[0].count,
                notifications: notifications[0].count
            },
            distributionData,
            donationSources,
            urgentNotifications
        });

    } catch (error) {
        console.error('Dashboard fetch error:', error);
        res.status(500).json({
            message: 'Error fetching dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            `SELECT 
                notification_id,
                message,
                is_read,
                created_at
             FROM NOTIFICATIONS
             WHERE is_read = FALSE
             ORDER BY created_at DESC
             LIMIT 50`
        );
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            message: 'Error fetching notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const [result] = await db.query(
            'UPDATE NOTIFICATIONS SET is_read = TRUE WHERE notification_id = ?',
            [notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Notification not found'
            });
        }

        res.json({
            message: 'Notification marked as read successfully'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            message: 'Error updating notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};