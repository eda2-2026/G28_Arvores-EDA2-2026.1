"use client";
import React, { useEffect, useState, useCallback } from "react";
import NavBar from "../components/navbar/NavBar";
import { FaBuilding, FaBook, FaArrowLeft } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { getOneProf, getAvaliacoesByProf, getOneUser, profileImageLoader } from "../utils/api";
import PostCard from "../components/post_card/PostCard";

function stableMergeSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
  if (!Array.isArray(array)) return array;

  const indexed = array.map((item, index) => ({ item, index }));

  function merge(left: typeof indexed, right: typeof indexed) {
    const result: typeof indexed = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      const cmp = compare(left[i].item, right[j].item);
      if (cmp < 0) {
        result.push(left[i++]);
      } else if (cmp > 0) {
        result.push(right[j++]);
      } else {
        if (left[i].index <= right[j].index) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
  }

  function sortSlice(arr: typeof indexed): typeof indexed {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sortSlice(arr.slice(0, mid));
    const right = sortSlice(arr.slice(mid));
    return merge(left, right);
  }

  const sortedIndexed = sortSlice(indexed);
  return sortedIndexed.map((x) => x.item);
}

const PerfilDeProfessor = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profId = searchParams.get("id");

  const [professor, setProfessor] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!profId) return;

    try {
      const [profData, avaliacoesData] = await Promise.all([
        getOneProf(Number(profId)),
        getAvaliacoesByProf(Number(profId)),
      ]);
      setProfessor(profData);

      const avaliacoesComUsuario = await Promise.all(
        avaliacoesData.map(async (avaliacao: any) => {
          try {
            const usuario = await getOneUser(avaliacao.userId);
            return {
              ...avaliacao,
              nomeUsuario: usuario.nome,
              fotoUsuario: usuario.fotosrc,
            };
          } catch (error) {
            return {
              ...avaliacao,
              nomeUsuario: "Usuário",
              fotoUsuario: "/profileSemFoto/profileSemFoto.jpg",
            };
          }
        })
      );

      const sortedAvaliacoes = stableMergeSort(avaliacoesComUsuario, (a, b) => {
        const ta = new Date(a.data).getTime();
        const tb = new Date(b.data).getTime();
        // para decrescente - mais recentes no topo
        return tb - ta;
      });

      setAvaliacoes(sortedAvaliacoes);
    } catch (error) {
      console.error("Erro ao carregar dados do professor:", error);
    } finally {
      setLoading(false);
    }
  }, [profId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <>
        
        <div className="text-center py-10">Carregando perfil...</div>
      </>
    );
  }

  return (
    <>
      

      <div className="flex bg-[#EDEDED] min-h-[calc(100vh-60px)] pt-10 pb-10 px-4">
        <div className="w-full max-w-2xl mx-auto relative">
          <button
            onClick={() => router.back()}
            className="absolute top-8 left-0 md:left-[-60px] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border flex items-center justify-center shadow-md hover:bg-gray-200 transition"
            title="Voltar"
          >
            <FaArrowLeft className="text-gray-700 text-lg md:text-xl" />
          </button>

          <div className="relative">
            <div className="bg-yellow-100 h-32 rounded-t-lg"></div>

            <div className="bg-white rounded-b-lg shadow-md px-4 sm:px-6 pt-1 pb-6 -mt-8 relative z-10">
              {/* Foto do professor */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex justify-center md:justify-start -mt-16">
                  <img
                    src={profileImageLoader({ src: professor?.fotosrc })}
                    alt="Foto do professor"
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>

              {/* Dados do professor */}
              <div className="pt-4 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-[#222E50] mb-2">
                  {professor?.nome ?? "Nome não informado"}
                </h2>

                <p className="text-[#222E50] flex items-center justify-center md:justify-start text-sm">
                  <FaBuilding className="mr-2 text-base" />
                  {professor?.departamento ?? "Departamento não informado"}
                </p>

                <p className="text-[#222E50] flex items-center justify-center md:justify-start text-sm">
                  <FaBook className="mr-2 text-base" />
                  {professor?.materias?.length
                    ? professor.materias.map((m: { nome: string }) => m.nome).join(", ")
                    : "Matérias não informadas"}
                </p>

                <hr className="my-6 border-[#595652]" />

                {/* Avaliações */}
                <div className="pb-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Avaliações
                  </h3>

                  {avaliacoes.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center md:text-left">
                      Nenhuma avaliação ainda.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {avaliacoes
                        .filter((avaliacao) => typeof avaliacao.id === "number" && !isNaN(avaliacao.id))
                        .map((avaliacao) => (
                          <PostCard
                            key={avaliacao.id}
                            id={avaliacao.id}
                            userId={avaliacao.userId}
                            userName={avaliacao.nomeUsuario ?? "Usuário"}
                            userImage={avaliacao.fotoUsuario ?? "/profileSemFoto/profileSemFoto.jpg"}
                            postDate={new Date(avaliacao.data).toLocaleString("pt-BR")}
                            nomeProfessor={professor?.nome}
                            materia={avaliacao.materia ?? "Matéria não informada"}
                            postContent={avaliacao.avaliacao}
                            onAction={fetchData}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerfilDeProfessor;
