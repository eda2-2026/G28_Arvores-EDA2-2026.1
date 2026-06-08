"use client";

import { useEffect, useMemo, useState } from "react";
import { insertionSort, mergeSort, quickSort, radixSort } from "./sortingHelpers";

type AlgorithmKey = "quickSort" | "mergeSort" | "radixSort" | "insertionSort";
type DatasetSize = 100 | 1000 | 10000;

type AlgorithmResult = {
  key: AlgorithmKey;
  label: string;
  timeMs: number;
  sorted: boolean;
};

type SizeResult = {
  size: DatasetSize;
  results: AlgorithmResult[];
};

const DATASET_SIZES: DatasetSize[] = [100, 1000, 10000];

const ALGORITHMS: Array<{
  key: AlgorithmKey;
  label: string;
  run: (data: number[]) => number[];
}> = [
  {
    key: "quickSort",
    label: "QuickSort",
    run: (data) => quickSort(data, (a: number, b: number) => a - b),
  },
  {
    key: "mergeSort",
    label: "MergeSort",
    run: (data) => mergeSort(data, (a: number, b: number) => a - b),
  },
  {
    key: "radixSort",
    label: "RadixSort",
    run: (data) => radixSort(data),
  },
  {
    key: "insertionSort",
    label: "InsertionSort",
    run: (data) => insertionSort(data, (a: number, b: number) => a - b),
  },
];

function createSeededRandom(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDataset(size: number, seed: number) {
  const random = createSeededRandom(seed);
  return Array.from({ length: size }, () => {
    const value = Math.floor(random() * 200000);
    return random() > 0.5 ? value : -value;
  });
}

function isSorted(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > values[i]) {
      return false;
    }
  }
  return true;
}

function formatMs(value: number) {
  return `${value.toFixed(3)} ms`;
}

function BenchmarkBar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const width = max === 0 ? 0 : Math.max(6, (value / max) * 100);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm text-slate-200">
        <span className="font-medium">{label}</span>
        <span>{formatMs(value)}</span>
      </div>
      <div className="h-4 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function BenchmarkPage() {
  const [results, setResults] = useState<SizeResult[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);

    const output: SizeResult[] = [];

    for (const size of DATASET_SIZES) {
      const input = generateDataset(size, 2026 + size);

      const sizeResults: AlgorithmResult[] = ALGORITHMS.map((algorithm) => {
        const dataCopy = [...input];
        const start = performance.now();
        const sorted = algorithm.run(dataCopy);
        const end = performance.now();

        return {
          key: algorithm.key,
          label: algorithm.label,
          timeMs: Number((end - start).toFixed(3)),
          sorted: isSorted(sorted),
        };
      });

      output.push({ size, results: sizeResults });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setResults(output);
    setLastRunAt(new Date().toLocaleString("pt-BR"));
    setRunning(false);
  };

  useEffect(() => {
    void runBenchmark();
  }, []);

  const fastestBySize = useMemo(() => {
    return results.map((group) => {
      const fastest = [...group.results].sort((a, b) => a.timeMs - b.timeMs)[0];
      return { size: group.size, fastest };
    });
  }, [results]);

  return (
    <main className="min-h-screen bg-[#050036] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        
          <h2 className="text-2xl font-semibold">Comparação de Busca: Sequencial vs Trie</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-lg">Executa várias buscas por prefixo numa lista de nomes simulada e mede o tempo médio.</p>
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={async () => {
                const names = generateDataset(1000, 42).map((n) => `Nome ${n}`);
                // constroi árvore
                const { default: Trie } = await import('../utils/trie');
                const t = new Trie();
                names.forEach((nm, i) => t.insert(nm, { id: i, nome: nm }));

                // gera prefixos para busca
                const prefixes = Array.from({ length: 200 }, (_, i) => names[Math.floor(Math.random() * names.length)].slice(0, 3));

                const tStart = performance.now();
                for (const p of prefixes) t.searchPrefix(p);
                const tEnd = performance.now();

                const sStart = performance.now();
                for (const p of prefixes) names.filter((n) => n.toLowerCase().startsWith(p.toLowerCase()));
                const sEnd = performance.now();

                alert(`Trie total: ${(tEnd - tStart).toFixed(3)} ms\nSequencial total: ${(sEnd - sStart).toFixed(3)} ms`);
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Executar comparação de busca
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}