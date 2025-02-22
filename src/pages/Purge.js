import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Purge = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/", { replace: true });
  };

  const headers = ["Nombre", "Billetera", "Balance actual", "Estado", "Razon"];
  const data = [
    {
      nombre: "Maicol Perez",
      username: "fhenexyZK",
      wallet: "0xFF2036009C056Bb3BEBB841fE00Cb53187c43bB8",
      current: "--",
      status: "Inactivo",
      reason: "Nunca perteneció al grupo de telegram",
    },
    {
      nombre: "Valeria Villamizar",
      username: "valeval__",
      wallet: "0xAfd11cEd5434CE6a88CdEE06a25921DfA0B783AE",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Navitas_1",
      username: "NAVASDELTA",
      wallet: "0xD062247C58148fFF31e8C29524C443D9AA13a519",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Santiago Ojeda",
      username: "santiagovsj",
      wallet: "0xF95856E8f077c99496a8872CFa982C21EfcD41D7",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Jonathan Restan",
      username: "ocho_shortys",
      wallet: "0x5827Dd247d381Ab52D30717A80Be755686Dc4B75",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Juan Jose Calderon",
      username: "josecaldev",
      wallet: "--",
      current: "--",
      status: "Inactivo",
      reason: "Se fue voluntariamente del grupo",
    },
    {
      nombre: "GaelYouKnow_",
      username: "GaelYouKnow_",
      wallet: "0x1bcF7c861f7CA4680E2763Eb2Eb2d090898bcBB0",
      current: "--",
      status: "Inactivo",
      reason: "Se fue voluntariamente del grupo",
    },
    {
      nombre: "Daniel Santiago Morales",
      username: "dantimorales",
      wallet: "0x29a25838a0985153340064115Db32cda45ab240c",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Francisco Freire",
      username: "PanchoUY",
      wallet: "--",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Jarinson Palacios",
      username: "palacios_v",
      wallet: "--",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Sebastián",
      username: "Zssebass",
      wallet: "0x6308A640c92C35CA5BED056cC5348465e5024D72",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Christian Aguilar",
      username: "AkaDakar",
      wallet: "0x728946cB371Cb2b24b11A2685d98fad7b2D06b14",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
    {
      nombre: "Joiner Pardo Prado",
      username: "Joipar21",
      wallet: "--",
      current: "--",
      status: "Inactivo",
      reason:
        "Última vez en Telegram hace semanas, por votación en snapshot, se decidió sacar a estas personas del grupo de Telegram.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="maxs-h-screen bg-background container mx-auto py-16 px-4"
    >
      <motion.button
        onClick={handleReturn}
        className="inline-flex items-center space-x-2 text-text-secondary
					hover:text-text-primary transition-all duration-200 mb-8
					hover:translate-x-[-5px]"
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Volver al inicio</span>
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl font-bold text-text-primary mb-8
									text-center"
      >
        Purga
      </motion.h1>

      <div className="overflow-x-auto">
        <motion.table
          className="min-w-full border border-gray-200 rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead className="bg-[#121212] text-white text-left">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="p-3 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="transition hover:bg-[rgb(90_0_204_/1)] hover:shadow text-left"
              >
                <td className="p-3 border">{item.nombre}</td>
                <td className="p-3 border w-[200px]">{item.wallet}</td>
                <td className="p-3 border max-w-xs whitespace-pre-wrap break-words">
                  {item.current}
                </td>
                <td className="p-3 border">{item.status}</td>
                <td className="p-3 border max-w-xs whitespace-pre-wrap break-words">
                  {item.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </motion.div>
  );
};

export default Purge;
