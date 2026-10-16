import {
  Activity, Archive, BarChart3, Binary, Bell, Boxes, Box, Bug, Cable, Calendar, Check, CheckCircle2, Clock, Cloud,
  Code2, Combine, Container, Cpu, Database, DatabaseZap, Download, Eye, Factory, FileCode2, FileJson, FileText,
  Filter, Flame, FlaskConical, FolderTree, Gauge, GitBranch, GitPullRequest, Globe, HardDrive, Hammer, Inbox, Layers,
  Layers3, Library, Link2, Lock, Network, Package, Play, Radio, RefreshCw, Rocket, Search, Send, Server, ServerCog,
  Settings2, Share2, Shapes, Shuffle, Snowflake, Sparkles, Table2, Target, Terminal, Timer, Truck, Upload, Users,
  Waypoints, Webhook, Workflow, Wrench, Zap, Trophy, Medal, Gem, ShieldCheck, Repeat, ListTree, Merge, Split,
  type LucideIcon,
} from 'lucide-react';

/** String keys keep infographic specs compact and declarative. */
export const ICONS = {
  activity: Activity, archive: Archive, chart: BarChart3, binary: Binary, bell: Bell, boxes: Boxes, box: Box,
  bug: Bug, cable: Cable, calendar: Calendar, check: Check, ok: CheckCircle2, clock: Clock, cloud: Cloud,
  code: Code2, combine: Combine, container: Container, cpu: Cpu, db: Database, dbzap: DatabaseZap,
  download: Download, eye: Eye, factory: Factory, filecode: FileCode2, json: FileJson, file: FileText,
  filter: Filter, flame: Flame, flask: FlaskConical, tree: FolderTree, gauge: Gauge, branch: GitBranch,
  pr: GitPullRequest, globe: Globe, disk: HardDrive, hammer: Hammer, inbox: Inbox, layers: Layers,
  layers3: Layers3, library: Library, link: Link2, lock: Lock, network: Network, package: Package, play: Play,
  radio: Radio, refresh: RefreshCw, rocket: Rocket, search: Search, send: Send, server: Server,
  servercog: ServerCog, settings: Settings2, share: Share2, shapes: Shapes, shuffle: Shuffle,
  snow: Snowflake, spark: Sparkles, table: Table2, target: Target, terminal: Terminal, timer: Timer,
  truck: Truck, upload: Upload, users: Users, waypoints: Waypoints, webhook: Webhook, workflow: Workflow,
  wrench: Wrench, zap: Zap, trophy: Trophy, medal: Medal, gem: Gem, shield: ShieldCheck, repeat: Repeat,
  listtree: ListTree, merge: Merge, split: Split,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export type Tone =
  | 'blue' | 'emerald' | 'amber' | 'violet' | 'rose'
  | 'cyan' | 'slate' | 'orange' | 'indigo' | 'teal';

/** A string (language independent) or an {az,en} pair. */
export type LText = string | { az: string; en: string };

/** Tiny helper to author bilingual labels: L('Mənbə', 'Source'). */
export const L = (az: string, en: string): LText => ({ az, en });
