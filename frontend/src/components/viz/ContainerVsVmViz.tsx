'use client';

import React, { useState } from 'react';
import { Server, Layers, Cpu, Box, Boxes, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { VizFrame, useViz } from './VizFrame';
import { L, type LText } from './shared';
import { cn } from '@/lib/utils';

interface MetricComparison {
  metric: LText;
  vm: LText;
  docker: LText;
}

const COMPARISONS: MetricComparison[] = [
  {
    metric: L('Başlama sürəti', 'Startup Speed'),
    vm: L('Dəqiqələr (OS tam yüklənir)', 'Minutes (Full OS boot)'),
    docker: L('Saniyələr / Millisaniyələr', 'Seconds / Milliseconds'),
  },
  {
    metric: L('Disk və Yaddaş', 'Disk & RAM Size'),
    vm: L('GB-lar (hər VM üçün ayrı OS)', 'GBs (separate OS per VM)'),
    docker: L('MB-lar (yalnız tətbiq və kitabxanalar)', 'MBs (only app & dependencies)'),
  },
  {
    metric: L('Nüvə (Kernel)', 'OS Kernel'),
    vm: L('Hər VM-in öz müstəqil kernel-i', 'Each VM runs its own full kernel'),
    docker: L('Host OS-in ümumi kernel-ini paylaşır', 'Shares host Linux kernel'),
  },
  {
    metric: L('İzolyasiya mexanizmi', 'Isolation Mechanism'),
    vm: L('Aparat (Hypervisor virtualizasiyası)', 'Hardware (Hypervisor virtualization)'),
    docker: L('Proses səviyyəsi (cgroups & namespaces)', 'Process-level (cgroups & namespaces)'),
  },
];

export function ContainerVsVmViz() {
  const { lt } = useViz();
  const [activeTab, setActiveTab] = useState<'stack' | 'metrics'>('stack');

  return (
    <VizFrame
      title={L('Virtual Maşın (VM) vs Docker Container', 'Virtual Machine (VM) vs Docker Container')}
      subtitle={L('Arxitektura fərqi: Hypervisor ilə ayrı OS vs Shared Kernel ilə yüngül proseslər', 'Architecture diff: Hypervisor with separate OS vs Shared kernel lightweight processes')}
      badge="DevOps"
      actions={
        <div className="flex rounded-lg border border-line bg-surface p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={cn(
              'rounded-md px-3 py-1 transition',
              activeTab === 'stack' ? 'bg-accent text-white shadow-xs dark:text-zinc-950 font-bold' : 'text-muted hover:text-ink',
            )}
          >
            {lt(L('Təbəqə Sxemi', 'Layered Stacks'))}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={cn(
              'rounded-md px-3 py-1 transition',
              activeTab === 'metrics' ? 'bg-accent text-white shadow-xs dark:text-zinc-950 font-bold' : 'text-muted hover:text-ink',
            )}
          >
            {lt(L('Müqayisə Matrisi', 'Metrics Matrix'))}
          </button>
        </div>
      }
      footer={L(
        'Container-lər host OS-in nüvəsini (kernel) paylaşdığı üçün yaddaş itkisi yoxdur və ani işə düşür. VM-lər isə tam aparat izolyasiyası təmin edir, lakin GB-larla yaddaş aparır.',
        'Containers share the host OS kernel with zero hypervisor overhead and instant boot times. VMs provide strict hardware isolation at the cost of GBs of duplicate OS overhead.',
      )}
    >
      {activeTab === 'stack' ? (
        <div className="grid gap-5 md:grid-cols-2">
          {/* ===================== VM STACK ===================== */}
          <div className="flex flex-col rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 transition-all">
            <div className="mb-3 flex items-center justify-between border-b border-rose-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center rounded-lg bg-rose-500/20 text-rose-500 font-bold text-[11px] px-2 py-0.5">
                  VM
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink">Virtual Machines</h4>
                  <p className="text-[10px] text-muted">Type-2 Hypervisor Stack</p>
                </div>
              </div>
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                Ağır (GB-lar)
              </span>
            </div>

            {/* Stacks from top to bottom */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-end text-center font-mono text-[11px]">
              {/* Apps row */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-md border border-rose-500/40 bg-surface p-1.5 font-bold text-ink shadow-2xs">App 1</div>
                <div className="rounded-md border border-rose-500/40 bg-surface p-1.5 font-bold text-ink shadow-2xs">App 2</div>
                <div className="rounded-md border border-rose-500/40 bg-surface p-1.5 font-bold text-ink shadow-2xs">App 3</div>
              </div>

              {/* Bins/Libs row */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-md border border-rose-500/30 bg-surface-2/80 p-1 text-[10px] text-muted">Bins / Libs</div>
                <div className="rounded-md border border-rose-500/30 bg-surface-2/80 p-1 text-[10px] text-muted">Bins / Libs</div>
                <div className="rounded-md border border-rose-500/30 bg-surface-2/80 p-1 text-[10px] text-muted">Bins / Libs</div>
              </div>

              {/* Guest OS (Heavy) */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-lg border-2 border-rose-500/60 bg-rose-500/15 p-2 font-bold text-rose-500">
                  Guest OS
                  <span className="block text-[9px] font-normal text-rose-400">~10-20 GB</span>
                </div>
                <div className="rounded-lg border-2 border-rose-500/60 bg-rose-500/15 p-2 font-bold text-rose-500">
                  Guest OS
                  <span className="block text-[9px] font-normal text-rose-400">~10-20 GB</span>
                </div>
                <div className="rounded-lg border-2 border-rose-500/60 bg-rose-500/15 p-2 font-bold text-rose-500">
                  Guest OS
                  <span className="block text-[9px] font-normal text-rose-400">~10-20 GB</span>
                </div>
              </div>

              {/* Hypervisor */}
              <div className="rounded-lg border border-line bg-surface-2 p-2 font-sans font-bold text-ink shadow-2xs">
                <div className="flex items-center justify-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-rose-400" />
                  <span>Hypervisor (ESXi / KVM / VirtualBox)</span>
                </div>
              </div>

              {/* Host OS */}
              <div className="rounded-lg border border-line bg-surface p-2 font-sans text-muted">
                Host Operating System (Linux / Windows)
              </div>

              {/* Hardware */}
              <div className="rounded-lg border border-line bg-surface-2/90 p-2 font-sans font-semibold text-muted flex items-center justify-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-muted" />
                <span>Server Hardware (CPU · RAM · Storage)</span>
              </div>
            </div>
          </div>

          {/* ===================== DOCKER STACK ===================== */}
          <div className="flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all">
            <div className="mb-3 flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500 font-bold text-[11px] px-2 py-0.5">
                  Docker
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink">Containers</h4>
                  <p className="text-[10px] text-muted">Shared Kernel Architecture</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                Yüngül (MB-lar)
              </span>
            </div>

            {/* Stacks from top to bottom */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-end text-center font-mono text-[11px]">
              {/* Apps row */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-md border border-emerald-500/40 bg-surface p-1.5 font-bold text-ink shadow-2xs">App 1</div>
                <div className="rounded-md border border-emerald-500/40 bg-surface p-1.5 font-bold text-ink shadow-2xs">App 2</div>
                <div className="rounded-md border border-emerald-500/40 bg-surface p-1.5 font-bold text-ink shadow-2xs">App 3</div>
              </div>

              {/* Bins/Libs row */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-md border border-emerald-500/30 bg-surface-2/80 p-1 text-[10px] text-muted">Bins / Libs</div>
                <div className="rounded-md border border-emerald-500/30 bg-surface-2/80 p-1 text-[10px] text-muted">Bins / Libs</div>
                <div className="rounded-md border border-emerald-500/30 bg-surface-2/80 p-1 text-[10px] text-muted">Bins / Libs</div>
              </div>

              {/* Docker Engine (No Guest OS!) */}
              <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/15 p-2 font-sans font-extrabold text-emerald-500 shadow-2xs">
                <div className="flex items-center justify-center gap-1.5">
                  <Boxes className="h-4 w-4 text-emerald-500" />
                  <span>Docker Engine (containerd / runc)</span>
                </div>
                <span className="block font-mono text-[9px] font-normal text-emerald-600 dark:text-emerald-400">
                  Guest OS yoxdur! Birbaşa host kernel-də işləyir
                </span>
              </div>

              {/* Host OS Kernel */}
              <div className="rounded-lg border border-emerald-500/30 bg-surface p-2 font-sans font-bold text-ink flex items-center justify-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                <span>Host OS (Paylaşılan Linux Kernel)</span>
              </div>

              {/* Hardware */}
              <div className="rounded-lg border border-line bg-surface-2/90 p-2 font-sans font-semibold text-muted flex items-center justify-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-muted" />
                <span>Server Hardware (CPU · RAM · Storage)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===================== METRICS MATRIX ===================== */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Parametr</th>
                <th className="py-2.5 px-3 text-rose-500">Virtual Machine (VM)</th>
                <th className="py-2.5 px-3 text-emerald-500">Docker Container</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 font-mono text-[11px]">
              {COMPARISONS.map((c, i) => (
                <tr key={i} className="hover:bg-surface-2/40 transition">
                  <td className="py-2.5 px-3 font-sans font-semibold text-ink">{lt(c.metric)}</td>
                  <td className="py-2.5 px-3 text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span>{lt(c.vm)}</span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{lt(c.docker)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </VizFrame>
  );
}
