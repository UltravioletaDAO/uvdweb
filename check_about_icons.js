const icons = require('@heroicons/react/24/outline');
const list = [
    'UserGroupIcon',
    'BeakerIcon',
    'AcademicCapIcon',
    'GlobeAltIcon',
    'FireIcon',
    'ChartBarIcon',
    'SparklesIcon',
    'PlayCircleIcon',
    'PhotoIcon',
    'HeartIcon',
    'VideoCameraIcon',
    'NewspaperIcon',
    'MicrophoneIcon',
    'RocketLaunchIcon',
    'BoltIcon'
];

console.log('Checking About.js icons...');
list.forEach(name => {
    if (!icons[name]) {
        console.log(`MISSING: ${name}`);
    } else {
        // console.log(`Found: ${name}`);
    }
});
console.log('Done.');
