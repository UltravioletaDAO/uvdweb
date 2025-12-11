const icons = require('lucide-react');
const list = [
    'BookOpen',
    'Coins',
    'Megaphone',
    'CheckCircle',
    'Bot',
    'MessageCircle',
    'Sparkles',
    'Gift',
    'ExternalLink',
    'PlayCircle',
    'BarChart3',
    'TrendingUp',
    'Award',
    'Flame',
    'Users',
    'Calendar',
    'Clock',
    'MapPin',
    'Heart'
];

console.log('Checking icons...');
list.forEach(name => {
    if (!icons[name]) {
        console.log(`Missing: ${name}`);
    } else {
        // console.log(`Found: ${name}`);
    }
});
console.log('Done.');
