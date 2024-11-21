const db = require('../config/db');

exports.dashboard = (req, res) => {
    const fetchDashboardData = () => {
        return new Promise((resolve, reject) => {
            const queries = {
                pendingDonations: `SELECT COUNT(*) as count FROM DONATIONS WHERE status = 'pending'`,
                todayDeliveries: `SELECT COUNT(*) as count FROM DELIVERIES WHERE DATE(start_time) = CURDATE()`,
                activeVolunteers: `SELECT COUNT(*) as count FROM VOLUNTEERS WHERE status = 'active'`,
                notifications: `SELECT COUNT(*) as count FROM NOTIFICATIONS WHERE is_read = 0`,
                distributionData: `
                    SELECT 
                        MONTH(donation_date) as month, 
                        SUM(quantity) as delivered 
                    FROM DONATIONS 
                    GROUP BY MONTH(donation_date)
                `,
                donationSources: `
                    SELECT 
                        WEEK(d.donation_date) as week, 
                        do.type as source_type, 
                        COUNT(*) as count 
                    FROM DONATIONS d
                    JOIN DONORS do ON d.donor_id = do.donor_id
                    GROUP BY WEEK(d.donation_date), do.type
                `,
                urgentNotifications: `
                    SELECT 
                        n.notification_id,
                        n.message,
                        n.severity,
                        n.reference_type,
                        n.action_url,
                        n.created_at,
                        CASE 
                            WHEN n.reference_type = 'donation' THEN 
                                CASE 
                                    WHEN EXISTS (
                                        SELECT 1 FROM DONATIONS d 
                                        WHERE d.donation_id = n.reference_id 
                                        AND d.status = 'pending'
                                    ) THEN 'Pending Donation'
                                    ELSE 'Donation Update'
                                END
                            WHEN n.reference_type = 'delivery' THEN 'Overdue Delivery'
                            WHEN n.reference_type = 'food_item' THEN 'Expiring Food'
                            ELSE 'General Alert'
                        END as alert_type
                    FROM NOTIFICATIONS n
                    WHERE n.is_read = 0 
                    AND (
                        n.severity = 'high'
                        OR (
                            n.reference_type = 'donation' 
                            AND EXISTS (
                                SELECT 1 FROM DONATIONS d 
                                WHERE d.donation_id = n.reference_id 
                                AND d.status = 'pending'
                            )
                        )
                    )
                    AND (n.expires_at IS NULL OR n.expires_at > NOW())
                    ORDER BY 
                        n.severity = 'high' DESC,
                        n.created_at DESC
                    LIMIT 5
                `
            };

            const results = {};
            let queriesCompleted = 0;

            Object.entries(queries).forEach(([key, sql]) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        console.error(`Error in ${key} query:`, err);
                        return reject(err);
                    }
                    
                    results[key] = result;
                    queriesCompleted++;

                    if (queriesCompleted === Object.keys(queries).length) {
                        resolve(results);
                    }
                });
            });
        });
    };

    fetchDashboardData()
        .then(data => {
            res.json({
                stats: {
                    pendingDonations: data.pendingDonations[0].count,
                    todayDeliveries: data.todayDeliveries[0].count,
                    activeVolunteers: data.activeVolunteers[0].count,
                    notifications: data.notifications[0].count
                },
                distributionData: data.distributionData,
                donationSources: data.donationSources,
                urgentNotifications: data.urgentNotifications
            });
        })
        .catch(err => {
            console.error('Dashboard fetch error:', err);
            res.status(500).json({ 
                message: 'Internal server error', 
                error: err.message 
            });
        });
};

exports.getNotifications = (req, res) => {
    const { severity } = req.query;
    const userId = req.user.id; // Assuming we have user info from auth middleware
    
    let sql = `
        SELECT 
            n.notification_id,
            n.message,
            n.severity,
            n.reference_type,
            n.reference_id,
            n.is_read,
            n.created_at,
            n.action_url,
            CASE 
                WHEN n.reference_type = 'donation' THEN 'Donation Update'
                WHEN n.reference_type = 'delivery' THEN 'Delivery Update'
                WHEN n.reference_type = 'volunteer' THEN 'Volunteer Update'
                WHEN n.reference_type = 'feedback' THEN 'New Feedback'
                WHEN n.reference_type = 'cash_donation' THEN 'Cash Donation'
                ELSE 'General Update'
            END as alert_type
        FROM NOTIFICATIONS n
        WHERE (n.expires_at IS NULL OR n.expires_at > NOW())
        AND (n.user_id = ? OR n.user_id IS NULL)
        ${severity ? 'AND n.severity = ?' : ''}
        ORDER BY n.created_at DESC
        LIMIT 50
    `;
    
    const params = severity ? [userId, severity] : [userId];
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ 
                message: 'Error fetching notifications',
                error: err.message 
            });
        }
        
        res.json(results);
    });
};

exports.markNotificationAsRead = (req, res) => {
    const { notificationId } = req.params;
    
    const sql = 'UPDATE NOTIFICATIONS SET is_read = 1 WHERE notification_id = ?';
    
    db.query(sql, [notificationId], (err, result) => {
        if (err) {
            console.error('Error marking notification as read:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        
        res.json({ message: 'Notification marked as read successfully' });
    });
};