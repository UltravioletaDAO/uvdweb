export const SNAPSHOT_SPACES = {
  ULTRAVIOLETA: {
    id: "ultravioletadao.eth",
    name: "Ultravioleta DAO",
    description: "Governance de Ultravioleta DAO"
  },
  CUCHORAPIDO: {
     id: "cuchorapido.eth",
     name: "Cuchorapido",
     description: "Governance de Cuchorapido DAO"
   },
};

export const getDefaultSpace = () => {
  return SNAPSHOT_SPACES.ULTRAVIOLETA.id;
}; 