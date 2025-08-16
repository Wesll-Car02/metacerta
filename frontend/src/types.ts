export type Previsao = {
  id: number;
  data_pesagem: string;
  peso_atual: number | null;
  peso_previsto: number;
};

export type Objetivo = {
  id: number;
  descricao: string;
};

export type Cliente = {
  id: number;
  nome: string;
  data_nascimento?: string | null;
  peso?: number | null;
  altura?: number | null;
  percent_gordura?: number | null;
  percent_massa?: number | null;
  previsoes: Previsao[];
  objetivo?: Objetivo | null;
};
