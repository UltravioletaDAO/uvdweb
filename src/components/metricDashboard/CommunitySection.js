import { MetricCard } from "../MetricCard";
import { MemberCard } from "../MemberCard";
import { Button } from "../Button";
import { Users, Calendar } from "lucide-react";
import { useTranslation } from 'react-i18next';

const activeMembersData = [
  {
    name: "Ultravioleta",
    avatar:
      "",
    role: "Lider Sectario",
    socials: [
      { platform: "twitter", url: "https://twitter.com/0xultravioleta" }
    ],
  },
  {
    name: "Member Name",
    avatar:
      "",
    role: "",
    socials: [
      { platform: "twitter", url: "https://twitter.com/username" },
      {
        platform: "discord",
        url: "https://discord.com/users/usename",
      }
    ],
  },
  {
    name: "Member Name",
    avatar:
      "",
    role: "",
    socials: [
      { platform: "twitter", url: "https://twitter.com/username" },
      {
        platform: "discord",
        url: "https://discord.com/users/usename",
      }
    ],
  },
  {
    name: "Member Name",
    avatar:
      "",
    role: "",
    socials: [
      { platform: "twitter", url: "https://twitter.com/username" },
      {
        platform: "discord",
        url: "https://discord.com/users/usename",
      }
    ],
  },
  {
    name: "Member Name",
    avatar:
      "",
    role: "",
    socials: [
      { platform: "twitter", url: "https://twitter.com/username" },
      {
        platform: "discord",
        url: "https://discord.com/users/usename",
      }
    ],
  },
  {
    name: "Member Name",
    avatar:
      "",
    role: "",
    socials: [
      { platform: "twitter", url: "https://twitter.com/username" },
      {
        platform: "discord",
        url: "https://discord.com/users/usename",
      }
    ],
  },
];

// Import the current DAO members list from ContributorSection
const currentDaoMembers = [
  "Ultra", "x4", "Txntacion", "Alejo", "f3l1p3", "Teddy Saint", "zircon", "cabomarzo",
  "Juan Jumaga", "cdt", "Cyber Paisa", "nezzcold", "Vens", "Yesi", "Fredino",
  "Waira Tamayo", "DavidZO", "Sindy Arenas", "Cymatix", "DatBoi",
  "Jangx", "David Rodríguez", "Juyan", "DogonPay", "Papossa",
  "Stov3", "Brandon Heat", "lualjarami", "ACPM", "Roypi", "0xPineda", "SaemTwentyTwo",
  "Jokker", "Andres", "0xvital.nad", "iEFx", "Detx8",
  "Valenciacrypto", "0xSoulChain", "xDream", "Poo", "Fabin", "Juliboy", "Mar", "ogsebitas", "Kysaug", "Burgos Σ", "Juan Suarez",
  "Nizo", "MichaelGA", "Mabu", "21", "OnlyZ_", "Alejandro Rosero", "Manussa21",
  "Gathus_", "Bob Cokirow", "JuanCCF", "Kadrez", "0xstiven", "Fixie", "JuanWx_", "sxxneiderxx", "Rehabilitation in Progress",
  "Bogotá Mag", "athan", "Karenn", "Jorge Toledo", "Ari", "ElBitterX", "r3c", "Hanma", "Pkante", "0xyuls", "Juandi",
  "painbrayan", "idk", "daninft", "Alx Dlarch", "daniiel_zp", "Mario Peña Alcazar", "Carza",
  "Andres92", "juanpkante", "JFQ", "0xj4an", "San Valencia", "Dev Cristobal"
];

export function CommunitySection() {
  const { t } = useTranslation();
  const memberCount = currentDaoMembers.length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-community/20">
              <Users className="h-6 w-6 text-community" />
            </div>
            {t('home.metrics.community_title') || 'Comunidad DAO'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('home.metrics.community_subtitle') || 'Miembros activos y participación de la comunidad'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('metricsDashboard.community.num_members') || 'Número de Miembros'}
          value={memberCount.toString()}
          variant="community"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.community.events_done') || 'Eventos Realizados'}
          value="12"
          description={t('metricsDashboard.community.events_desc') || 'Quedadas, Workshops...'}
          variant="community"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t('metricsDashboard.community.members_title') || 'Miembros de la comunidad'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="border-community/30"
              asChild
            >
              <a
                href="https://ultravioletadao.xyz/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('metricsDashboard.community.join') || 'Únete a UltravioletaDAO'}
              </a>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {activeMembersData.map((member, index) => (
              <MemberCard
                key={index}
                name={member.name}
                avatar={member.avatar}
                role={member.role}
                socials={member.socials}
              />
            ))}
          </div>

          <div className="text-center py-4">
            <Button
              variant="outline"
              className="border-community/30 text-community"
            >
              {t('metricsDashboard.community.view_all_members', { count: memberCount }) || `Ver Todos los Miembros (${memberCount})`}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('metricsDashboard.community.recent_activity') || 'Actividad Reciente'}</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-community/20 bg-gradient-to-br from-community/5 to-transparent">
                <div className="space-y-2">
                  <div className="text-sm font-medium">#1</div>
                  <div className="text-xs text-muted-foreground">
                    Lorem Ipsum es simplemente el texto
                  </div>
                  <div className="text-xs">
                    Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.
                    2024.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-community/20 bg-gradient-to-br from-community/5 to-transparent">
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    #2
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Lorem Ipsum es simplemente el texto
                  </div>
                  <div className="text-xs">
                    Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-community/20 bg-gradient-to-br from-community/5 to-transparent">
                <div className="space-y-2">
                  <div className="text-sm font-medium">#3</div>
                  <div className="text-xs text-muted-foreground">
                    Lorem Ipsum es simplemente el texto
                  </div>
                  <div className="text-xs">
                    Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('metricsDashboard.community.quick_links') || 'Enlaces Rápidos'}</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-community/30"
                asChild
              >
                <a
                  href="https://discord.gg/FxcYZqYySp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('metricsDashboard.community.discord') || 'Discord Server'}
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-community/30"
                asChild
              >
                <a
                  href="https://x.com/UltravioletaDAO"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('metricsDashboard.community.twitter') || 'Twitter/X'}
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-community/30"
                asChild
              >
                <a
                  href="https://starsarena.com/UltravioletaDAO"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('metricsDashboard.community.the_arena') || 'The Arena'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
