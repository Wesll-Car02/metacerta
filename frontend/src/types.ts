export type Previsao = {
  id: number;
  data_pesagem: string;
  peso_atual: number | null;
  peso_previsto: number;
};

export type Cliente = {
  id: number;
  nome: string;
  previsoes: Previsao[];
  objetivo?: { descricao: string } | null;
};
