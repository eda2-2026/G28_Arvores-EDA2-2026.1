"use client";
import React, { useEffect, useState } from "react";
import NavBar from "./components/navbar/NavBar";
import CarrosselProfessores from "./components/carrossel/carrossel";
import DropdownOrdenar from "./components/ordenar/ordenar";
import BarraPes from "./components/pesquisa/pesquisa";
import ProfQuadro from "./components/quadro/Quadro";
import { Footer } from "./components/footer/footer";
import { getAllProf } from "./utils/api";
import Link from "next/link";

const Home = () => {
  type Professor = {
    id: number;
    nome: string;
    materia: string;
    departamento: string;
    fotosrc: string;
  };

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [nameTrie, setNameTrie] = useState<any | null>(null);
  const [deptTrie, setDeptTrie] = useState<any | null>(null);
  const [ordenacao, setOrdenacao] = useState<
    'nome' | 'departamento' | 'recentes' | 'antigas' | 'id'
  >('recentes');
  const [filtro, setFiltro] = useState<Professor[]>([]);

  const fetchProfessores = async () => {
    console.log("Página Home: A função fetchProfessores foi chamada!");
    try {
      const data = await getAllProf();
      setProfessores(data);
      setFiltro(data);
      // constroi árvore por nome e departamento para a busca por prefixo
      try {
        const Trie = (await import('./utils/trie')).default;
        const tName = new Trie();
        const tDept = new Trie();
        data.forEach((p: any) => {
          if (typeof p.nome === 'string') tName.insert(p.nome, { id: p.id, nome: p.nome, departamento: p.departamento });
          if (typeof p.departamento === 'string') tDept.insert(p.departamento, { id: p.id, nome: p.nome, departamento: p.departamento });
        });
        setNameTrie(tName);
        setDeptTrie(tDept);
      } catch (e) {
        console.warn('Trie util not available:', e);
      }
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    }
  };

  useEffect(() => {
    fetchProfessores();
    window.addEventListener('professorCreated', fetchProfessores);

    return () => {
      window.removeEventListener('professorCreated', fetchProfessores);
    };
  }, []);

  const professoresRecentes = professores.slice(-8);

  const quickSort = <T,>(
  arr: T[],
  compareFn: (a: T, b: T) => number,
  left = 0,
  right = arr.length - 1
): T[] => {
  const copy = [...arr];

  const partition = (low: number, high: number): number => {
    const pivot = copy[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (compareFn(copy[j], pivot) < 0) {
        i++;
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
    }

    [copy[i + 1], copy[high]] = [copy[high], copy[i + 1]];
    return i + 1;
  };

  const sort = (low: number, high: number): void => {
    if (low < high) {
      const pi = partition(low, high);

      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  };

  sort(left, right);
  return copy;
};

  const radixSort = (arr: number[]): number[] => {
    if (arr.length <= 1) return [...arr];

    let result = [...arr];
    const max = Math.max(...result);
    let exp = 1;

    while (Math.floor(max / exp) > 0) {
      const output = new Array(result.length);
      const count = new Array(10).fill(0);

      for (const num of result) {
        const digit = Math.floor(num / exp) % 10;
        count[digit]++;
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      for (let i = result.length - 1; i >= 0; i--) {
        const digit = Math.floor(result[i] / exp) % 10;
        output[count[digit] - 1] = result[i];
        count[digit]--;
      }

      result = output;
      exp *= 10;
    }

    return result;
  };

  const professoresOrdenados = (() => {
    if (ordenacao === "nome") {
      return quickSort(
        professores,
        (a, b) => a.nome.localeCompare(b.nome)
      );
    }

    if (ordenacao === "departamento") {
      return quickSort(
        professores,
        (a, b) => a.departamento.localeCompare(b.departamento)
      );
    }

    if (ordenacao === "id") {
      const idsOrdenados = radixSort(
        professores.map((prof) => prof.id)
      );

      return idsOrdenados
        .map((id) =>
          professores.find((prof) => prof.id === id)
        )
        .filter(Boolean) as Professor[];
    }

    return [...professores];
  })();

  const handleSearch = (searchTerm: string, modo: "nome" | "departamento") => {
    if (searchTerm === "") {
      setFiltro(professores);
      return;
    }

    // se trie estiver disponível, o use, se não, volta para anterior
    try {
      const results = modo === 'nome' && nameTrie
        ? nameTrie.searchPrefix(searchTerm, 200)
        : modo === 'departamento' && deptTrie
        ? deptTrie.searchPrefix(searchTerm, 200)
        : [];

      if (results && results.length > 0) {
        // mapeia IDs
        const ids = new Set(results.map((r: any) => r.id));
        const filtrados = professores.filter((p) => ids.has(p.id));
        setFiltro(filtrados);
        return;
      }
    } catch (e) {
    }

    const filtrados = professores.filter((p) =>
      modo === "nome"
        ? p.nome.toLowerCase().startsWith(searchTerm.toLowerCase())
        : p.departamento.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFiltro(filtrados);
  };

  return (
    <>
      <div className="flex justify-end px-10 pr-23 mt-4">
        <BarraPes
          onSearch={handleSearch}
          sugestoes={professores.map((p) => ({
            nome: p.nome,
            departamento: p.departamento,
          }))}
        />
      </div>

      {filtro.length < professores.length ? (
        <section className="px-10 py-6">
          <h2 className="text-3xl font-medium ml-4">Resultado da Pesquisa</h2>
          {filtro.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {filtro.map((prof) => (
                <Link href={`/perfilDeProfessor?id=${prof.id}`} key={prof.id}>
                  <ProfQuadro
                    id={prof.id}
                    nome={prof.nome}
                    materia={prof.materia}
                    departamento={prof.departamento}
                    fotosrc={prof.fotosrc}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-medium text-gray-500 mt-4 ml-4">Nenhum professor encontrado.</p>
          )}
        </section>
      ) : (
        <>
          <section className="px-4 sm:px-8 md:px-10 lg:px-15 py-10">
            <h2 className="text-3xl font-medium ml-4 sm:ml-8 md:ml-10">Novos Professores</h2>
            <CarrosselProfessores professores={professoresRecentes} />
          </section>

          <section className="px-4 sm:px-8 md:px-10 lg:px-15 py-10">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-3xl font-medium ml-4 sm:ml-8 md:ml-10">Todos os Professores</h2>
              <DropdownOrdenar ordenacao={ordenacao} setOrdenacao={setOrdenacao} />
            </div>
            <CarrosselProfessores professores={professoresOrdenados} />
          </section>
        </>
      )}

      <Footer></Footer>
    </>
  );
};

export default Home;
