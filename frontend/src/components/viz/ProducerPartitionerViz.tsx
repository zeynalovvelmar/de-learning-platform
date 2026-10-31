'use client';

import React, { useState } from 'react';
import { Hash, Layers, AlertTriangle, CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { VizFrame } from './VizFrame';
import { L } from './shared';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

type PartitionerMode = 'keyed' | 'sticky' | 'trap';

export function ProducerPartitionerViz() {
  const { language } = useLanguage();
  const az = language === 'az';
  const [mode, setMode] = useState<PartitionerMode>('keyed');

  const tabs: { id: PartitionerMode; label: string; icon: React.ElementType }[] = [
    {
      id: 'keyed',
      label: az ? '1. Açarlı Heş (murmur2 % N)' : '1. Keyed Hash (murmur2 % N)',
      icon: Hash,
    },
    {
      id: 'sticky',
      label: az ? '2. Sticky Partitioner (Key=NULL)' : '2. Sticky Partitioner (Key=NULL)',
      icon: Layers,
    },
    {
      id: 'trap',
      label: az ? '3. Partisiya Artırma Tələsi (3 → 6)' : '3. Partition Expansion Trap (3 → 6)',
      icon: AlertTriangle,
    },
  ];

  return (
    <VizFrame
      badge="Producer Partitioner"
      title={L(
        'Producer Partitioner: Açarlı Heşləmə vs Sticky Partitioning',
        'Producer Partitioner: Deterministic Key Hashing vs Sticky Partitioning'
      )}
      subtitle={L(
        'Mesajın hansı partisiyaya düşməsini təyin edən alqoritm və partisiya sayını artırma tələsi',
        'How Kafka routes records across partitions and why expanding partitions breaks keyed ordering'
      )}
      actions={
        <div className="inline-flex flex-wrap rounded-lg border border-line bg-surface p-0.5 text-xs font-mono">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = mode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition cursor-pointer',
                  active
                    ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                    : 'text-muted hover:text-ink'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      }
      footer={
        mode === 'keyed'
          ? L(
              'Açar göndərildikdə Kafka abs(murmur2(key)) % num_partitions düsturunu hesablayır. Eyni açarlı (məs: "cust_A") bütün hadisələr HƏMİŞƏ eyni partisiyaya düşür və FIFO ardıcıllığı qorunur.',
              'When a key is provided, Kafka computes abs(murmur2(key)) % num_partitions. All events with the same key ("cust_A") always land on the exact same partition, guaranteeing strict FIFO order.'
            )
          : mode === 'sticky'
          ? L(
              'Açar NULL olduqda Sticky Partitioner şəbəkə paketini (batch.size / linger.ms) tam doldurana qədər eyni partisiyaya yazır, sonra növbəti partisiyaya keçir.',
              'When key is NULL, the Sticky Partitioner fills an entire micro-batch on one partition before rotating to the next, reducing network RPC overhead and latency.'
            )
          : L(
              'TƏLÜKƏ: Partisiya sayını 3-dən 6-ya qaldırdıqda modulo böləni dəyişir (10 % 3 = P1 ikən, 10 % 6 = P4 olur). Köhnə hadisələr P1-də, yenilər P4-də qaldığı üçün müştəri üzrə sıralama birdəfəlik pozulur!',
              'TRAP: Increasing partitions from 3 to 6 changes the modulo divisor (10 % 3 = P1 becomes 10 % 6 = P4). Historical events stay in P1 while new events go to P4, breaking per-key ordering!'
            )
      }
    >
      <div className="w-full space-y-4 font-mono text-xs">
        {/* MODE 1: KEYED HASHING */}
        {mode === 'keyed' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-2">
              <span className="text-muted">
                Formula: <code className="text-primary font-bold">target_partition = abs(murmur2(key)) % 3</code>
              </span>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-bold">
                {az ? '100% Deterministik Sıralama' : '100% Deterministic Routing'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: '"cust_B"',
                  hash: 'murmur2("cust_B") = 21',
                  calc: '21 % 3 = 0',
                  part: 'Partition 0',
                  events: ['#0: INSERT', '#1: UPDATE'],
                  tone: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
                },
                {
                  key: '"cust_C"',
                  hash: 'murmur2("cust_C") = 16',
                  calc: '16 % 3 = 1',
                  part: 'Partition 1',
                  events: ['#0: INSERT'],
                  tone: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
                },
                {
                  key: '"cust_A"',
                  hash: 'murmur2("cust_A") = 14',
                  calc: '14 % 3 = 2',
                  part: 'Partition 2',
                  events: ['#0: INSERT', '#1: PAY 50₼', '#2: SHIP'],
                  tone: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
                },
              ].map((item) => (
                <div key={item.key} className={cn('rounded-xl border p-3.5 space-y-2.5', item.tone)}>
                  <div className="flex items-center justify-between border-b border-line/50 pb-2">
                    <span className="font-bold text-ink">Key: {item.key}</span>
                    <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-bold text-primary border border-line">
                      {item.calc}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted">{item.hash}</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item.part}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.events.map((ev) => (
                      <span
                        key={ev}
                        className="rounded bg-surface-lowest border border-line/60 px-2 py-1 text-[10px] text-ink font-semibold"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: STICKY PARTITIONER */}
        {mode === 'sticky' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-2">
              <span className="text-muted">
                Config: <code className="text-primary font-bold">key = None · batch.size = 32KB · linger.ms = 20</code>
              </span>
              <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-blue-300 font-bold">
                {az ? 'Minimum Şəbəkə Gecikməsi (Batching)' : 'High-Throughput Micro-Batching'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> Batch #1 → Partition 1 (Sticky)
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    BATCH FULL (Sent)
                  </span>
                </div>
                <p className="text-[11px] text-ink-2 font-sans">
                  {az
                    ? 'Köhnə Round-Robin hər mesajı fərqli partisiyaya səpələyib kiçik paketlər yaradırdı. Sticky Partitioner isə bufer dolana qədər ardıcıl mesajları tək partisiyaya (P1) yığır:'
                    : 'Instead of scattering individual records across partitions, Sticky Partitioner packs consecutive null-key records into Partition 1 until the batch fills:'}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['msg_1 (NULL)', 'msg_2 (NULL)', 'msg_3 (NULL)'].map((m, i) => (
                    <div key={m} className="rounded border border-emerald-500/40 bg-surface p-2 text-center">
                      <div className="text-[10px] text-emerald-300 font-bold">P1 · Offset #{89 + i}</div>
                      <div className="text-[10px] text-ink mt-0.5">{m}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> Batch #2 → Partition 2 (Rotated)
                  </span>
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    FILLING BUFFER…
                  </span>
                </div>
                <p className="text-[11px] text-ink-2 font-sans">
                  {az
                    ? '1-ci paket göndərildikdən (və ya linger.ms bitdikdən) sonra Partitioner avtomatik növbəti partisiyaya (P2) yapışır və yeni paketi doldurur:'
                    : 'Once Batch #1 dispatches (batch.size reached or linger.ms expires), the producer rotates and sticks to Partition 2 for the next batch:'}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['msg_4 (NULL)', 'msg_5 (NULL)', 'msg_6 (NULL)'].map((m, i) => (
                    <div key={m} className="rounded border border-blue-500/40 bg-surface p-2 text-center">
                      <div className="text-[10px] text-blue-300 font-bold">P2 · Offset #{40 + i}</div>
                      <div className="text-[10px] text-ink mt-0.5">{m}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: PARTITION EXPANSION TRAP */}
        {mode === 'trap' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Expansion */}
              <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> {az ? 'Əvvəl: 3 Partisiya' : 'Before: 3 Partitions'}
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    10 % 3 = Partition 1
                  </span>
                </div>
                <div className="text-[11px] text-ink-2 font-sans">
                  {az
                    ? 'murmur2("cust_8821") = 10 olduqda bütün ilkin əməliyyatlar Partition 1-ə yazılır:'
                    : 'With murmur2("cust_8821") = 10, all initial events route to Partition 1:'}
                </div>
                <div className="rounded-lg border border-line bg-surface p-2.5 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-300">Partition 1 Log:</div>
                  <div className="text-[11px] text-ink">Offset #0: cust_8821 → CREATE ACCOUNT</div>
                  <div className="text-[11px] text-ink">Offset #1: cust_8821 → DEPOSIT +100 AZN</div>
                </div>
              </div>

              {/* After Expansion */}
              <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> {az ? 'Sonra: 6 Partisiya (TƏLƏ!)' : 'After: 6 Partitions (BROKEN!)'}
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    10 % 6 = Partition 4!
                  </span>
                </div>
                <div className="text-[11px] text-ink-2 font-sans">
                  {az
                    ? 'Partisiya sayı 6-ya artırılan kimi eyni "cust_8821" açarı artıq Partition 4-ə düşür:'
                    : 'After expanding to 6 partitions, the exact same key "cust_8821" now hashes to Partition 4:'}
                </div>
                <div className="rounded-lg border border-rose-500/40 bg-surface p-2.5 space-y-1">
                  <div className="text-[10px] font-bold text-rose-300">Partition 4 Log (New!):</div>
                  <div className="text-[11px] text-ink">Offset #0: cust_8821 → WITHDRAW -40 AZN</div>
                  <div className="text-[10px] text-rose-300 font-sans pt-0.5">
                    {az
                      ? '❌ Consumer 4 pul çıxılmasını Consumer 1 hesabı yaratmamışdan ƏVVƏL oxuya bilər!'
                      : '❌ Consumer on P4 may process WITHDRAW before P1 processes CREATE ACCOUNT!'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VizFrame>
  );
}
