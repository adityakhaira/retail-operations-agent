const activities = [];

function logActivity(activity) {
    const entry = {
        id: activities.length + 1,
        timestamp: new Date().toISOString(),
        ...activity
    };

    activities.push(entry);

    return entry;
}

function getActivities() {
    return activities;
}

module.exports = {
    logActivity,
    getActivities
};