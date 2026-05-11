"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import NavBar from "@/app/components/navbar/NavBar";
import MeditComment from "@/app/components/m_editar_comment/M_Editar_Comment";
import {
  getOneAvaliacao,
  getComentariosByAvaliacao,
  getOneUser,
  getOneProf,
  deleteComentario,
  deleteAvaliacao,
  profileImageLoader,
} from "@/app/utils/api";
import MeditAvaliacao from "../components/m_editar_avaliacao/M_Editar_Avaliacao";

const mergeSortComentarios = <T extends { data: string }>(items: T[]): T[] => {
  if (items.length <= 1) return items;

  const middle = Math.floor(items.length / 2);
  const left = mergeSortComentarios(items.slice(0, middle));
  const right = mergeSortComentarios(items.slice(middle));

  const merged: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftTime = new Date(left[leftIndex].data).getTime();
    const rightTime = new Date(right[rightIndex].data).getTime();

    if (leftTime <= rightTime) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return merged.concat(left.slice(leftIndex), right.slice(rightIndex));
};

// --- Componente para o Card de Comentário ---
const CommentCard = ({ comment, onAction }: { comment: any, onAction: () => void }) => {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: { sub?: string } = jwtDecode(token);
        if (decoded.sub) setCurrentUserId(Number(decoded.sub));
      } catch (error) { console.error("Erro ao decodificar token:", error); }
    }
  }, []);

  const canEditOrDelete = currentUserId === comment.usersId;

  const handleDelete = async () => {
    if (window.confirm("Tem a certeza que deseja excluir este comentário?")) {
      await deleteComentario(comment.id);
      onAction();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link href={`/perfilDeUsuario?id=${comment.usersId}`}>
            <img 
              src={profileImageLoader({ src: comment.userImage })} 
              alt={comment.userName} 
              className="w-8 h-8 rounded-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; 
              }}
            />
        </Link>
        <p className="font-bold text-sm text-[#050036]">{comment.userName}</p>
        <span className="text-xs text-gray-500">· {new Date(comment.data).toLocaleString("pt-BR")}</span>
        {canEditOrDelete && (
            <div className="flex gap-3 text-gray-500 ml-auto">
                <button onClick={() => setIsEditModalOpen(true)} title="Editar"><FaEdit size={14} className="hover:text-blue-600" /></button>
                <button onClick={handleDelete} title="Excluir"><FaTrash size={14} className="hover:text-red-600" /></button>
            </div>
        )}
      </div>
      <div className="text-gray-800 text-sm pl-10 pt-1" dangerouslySetInnerHTML={{ __html: comment.conteudo }}/>
       <MeditComment
        isOpen={isEditModalOpen}
        onCloseAction={() => { setIsEditModalOpen(false); onAction(); }}
        comentarioId={comment.id}
        conteudoAtual={comment.conteudo}
      />
    </div>
  );
}


const PaginaAvaliacao = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const avaliacaoId = searchParams.get("id");

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isOwnerOfAvaliacao = avaliacao ? currentUserId === avaliacao.userId : false;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false); // Fecha o modal
    fetchDados(); // Chama a sua função existente para recarregar os dados da página
  };

  const fetchDados = async () => {
    if (!avaliacaoId) { setLoading(false); return; }
    try {
      setLoading(true);
      const idNumerico = Number(avaliacaoId);
      const [avaliacaoData, comentariosData] = await Promise.all([ getOneAvaliacao(idNumerico), getComentariosByAvaliacao(idNumerico) ]);
      const [userData, profData] = await Promise.all([ getOneUser(avaliacaoData.userId), getOneProf(avaliacaoData.profId) ]);
      setAvaliacao({ ...avaliacaoData, userName: userData.nome, userImage: userData.fotosrc, nomeProfessor: profData.nome });
      const comentariosComUsuario = await Promise.all(
        comentariosData.map(async (c: any) => ({ ...c, user: await getOneUser(c.usersId) }))
      );
      const comentariosOrdenados = mergeSortComentarios(
        comentariosComUsuario.map((c) => ({ ...c, userName: c.user.nome, userImage: c.user.fotosrc }))
      );
      setComentarios(comentariosOrdenados);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setAvaliacao(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: { sub?: string } = jwtDecode(token);
        if (decoded.sub) setCurrentUserId(Number(decoded.sub));
      } catch (error) { console.error("Erro ao decodificar token:", error); }
    }
    fetchDados();
  }, [avaliacaoId]);
  
  const handleDeletarAvaliacao = async () => {
    if (window.confirm("Tem a certeza que deseja excluir esta avaliação?")) {
        await deleteAvaliacao(avaliacao.id);
        router.back();
    }
};

    if (loading) {
    return (<><NavBar /><div className="text-center text-gray-500 py-20">Carregando...</div></>);
    }

    if (!avaliacao) {
    return (<><NavBar /><div className="text-center text-gray-500 py-20">Avaliação não encontrada.</div></>);
    }

    return (
    <>
        
        <div className="bg-[#EDEDED] min-h-screen">
            <div className="w-full max-w-2xl mx-auto relative px-4">
          
            <button
            onClick={() => router.back()}
            className="absolute top-8 left-[-60px] md:left-[-80px] w-12 h-12 rounded-full bg-white border flex items-center justify-center shadow-md hover:bg-gray-200 transition"
            title="Voltar"
            >
            <FaArrowLeft className="text-gray-700 text-xl" />
            </button>
          
          {/*  container branco  */}
        <div className="bg-white shadow-lg p-4 sm:p-6 min-h-screen">
            
            {/* Ocard amarelo da avaliação */}
            <div className="bg-yellow-100 rounded-[40px] p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/perfilDeUsuario?id=${avaliacao.userId}`}>
                            <img 
                              src={profileImageLoader({ src: avaliacao.userImage })} 
                              alt={avaliacao.userName} 
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                                (e.target as HTMLImageElement).src = "/profileSemFoto/profileSemFoto.jpg"; 
                              }}
                            />
                        </Link>
                        <div>
                            <p className="font-bold text-[#050036] text-base">{avaliacao.userName}</p>
                            <span className="font-normal text-sm text-gray-600">{new Date(avaliacao.data).toLocaleString("pt-BR")} · {avaliacao.nomeProfessor} · {avaliacao.materia}</span>
                        </div>
                    </div>
                  {isOwnerOfAvaliacao && (
                        <div className="flex gap-4 text-gray-600">
                            <button onClick={() => setIsEditModalOpen(true)} title="Editar"><FaEdit className="text-lg hover:text-blue-600" /></button>
                            <button onClick={handleDeletarAvaliacao} title="Excluir"><FaTrash className="text-lg hover:text-red-600" /></button>
                        </div>
                    )}
                </div>
              <p className="text-[#050036] text-base" dangerouslySetInnerHTML={{ __html: avaliacao.avaliacao }} />
                <div className="flex items-center gap-2 text-gray-700 mt-2">
                <p className="text-sm">{comentarios.length} comentários</p>
                </div>
              {comentarios.length > 0 && (
                <hr className="border-t-2 border-black my-2" />
              )}
                <div className="flex flex-col gap-4">
                {comentarios.map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    <CommentCard comment={comment} onAction={fetchDados} />

                    {index < comentarios.length - 1 && (
                      <hr className="border-gray-300 w-11/12 mx-auto" />
                    )}
                  </React.Fragment>
                ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    {isEditModalOpen && (
        <MeditAvaliacao
          isOpen={isEditModalOpen}
          onCloseAction={handleEditSuccess}
          avaliacaoId={avaliacao.id}
          avaliacaoAtual={avaliacao.avaliacao}
        />
    )}
    </>
  );;
};

export default PaginaAvaliacao;