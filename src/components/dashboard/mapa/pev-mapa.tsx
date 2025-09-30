'use client';

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Grid
} from "@mui/material";

// Ícones para pontos operacionais e inoperantes
const PEVIcon = new L.Icon({
  iconUrl: "/assets/pev-icon.png",
  iconRetinaUrl: "/assets/pev-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const PEVIconInoperante = new L.Icon({
  iconUrl: "/assets/pev-icon-gray.png", // Ícone cinza (adicione essa imagem em /public/assets/)
  iconRetinaUrl: "/assets/pev-icon-gray.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Ponto {
  id: string;
  nome: string;
  endereco: string;
  operacional: boolean;
  coords: [number, number];
}

function MapEvents({ onClickMap }: { onClickMap: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClickMap(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapaColetas() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [modo, setModo] = useState<"visualizacao" | "adicao" | "exclusao">("visualizacao");
  const [novoPonto, setNovoPonto] = useState<{ lat: number; lng: number } | null>(null);
  const [nomePonto, setNomePonto] = useState("");
  const [enderecoPonto, setEnderecoPonto] = useState("");
  const [operacional, setOperacional] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: "success" | "error"; mensagem: string } | null>(null);
  const [pontoEdicao, setPontoEdicao] = useState<Ponto | null>(null);
  const [pontoExclusao, setPontoExclusao] = useState<Ponto | null>(null);


  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coordenadas_mapa"), (snap) => {
      const lista = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Ponto, "id">),
      }));
      setPontos(lista);
    });
    return () => unsub();
  }, []);

  const handleSalvarPonto = async () => {
    if (novoPonto && nomePonto.trim()) {
      await addDoc(collection(db, "coordenadas_mapa"), {
        coords: [novoPonto.lat, novoPonto.lng],
        nome: nomePonto,
        endereco: enderecoPonto,
        operacional: false,
      });
      setNovoPonto(null);
      setNomePonto("");
      setEnderecoPonto("");
      setFeedback({ tipo: "success", mensagem: "PEV adicionado com sucesso!" });
    }
  };

const handleExcluirPonto = async (id: string) => {
  try {
    const docRef = doc(db, "pontosColeta", id);
    await deleteDoc(docRef);
    console.log("Ponto excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir ponto:", error);
  }
};



  const handleSalvarEdicao = async () => {
    if (pontoEdicao) {
      await updateDoc(doc(db, "coordenadas_mapa", pontoEdicao.id), {
        nome: pontoEdicao.nome,
        endereco: pontoEdicao.endereco,
        operacional: pontoEdicao.operacional,
      });
      setFeedback({ tipo: "success", mensagem: "PEV atualizado com sucesso!" });
      setPontoEdicao(null);
    }
  };

  const centro: [number, number] = [-5.1069, -38.3728];

  return (
    <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
      {/* Mapa */}
      <Box
        sx={{
          flex: 1,
          height: "700px",
          mt: 2,
          borderRadius: 2,
          boxShadow:
            "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
        }}
      >
        {/* Aviso sobre modos */}
        {(modo === "adicao" || modo === "exclusao") && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              p: 1.5,
              borderRadius: 1,
              fontWeight: "bold",
              textAlign: "center",
              backgroundColor: modo === "adicao" ? "#FFF3CD" : "#F8D7DA",
              border: modo === "adicao" ? "1px solid #FFEEBA" : "1px solid #F5C2C7",
              minWidth: 240,
              boxShadow: 2,
            }}
          >
            {modo === "adicao"
              ? "Modo de adição de PEVs ativo. Clique no mapa para adicionar."
              : "Modo de exclusão de PEVs ativo. Clique em um ponto para excluir."}
          </Box>
        )}

        <MapContainer center={centro} zoom={10} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {modo === "adicao" && <MapEvents onClickMap={(lat, lng) => setNovoPonto({ lat, lng })} />}

          {pontos.map((p) => (
            <Marker
              key={p.id}
              position={p.coords}
              icon={p.operacional ? PEVIcon : PEVIconInoperante}
              eventHandlers={{
                click: () => {
                  if (modo === "exclusao") setPontoExclusao(p);
                  if (modo === "visualizacao") setPontoEdicao(p);
                },
              }}

            >
              <Tooltip>{p.nome}</Tooltip>
              <Popup>
                <Typography variant="subtitle1">{p.nome}</Typography>
                <Typography variant="body2">Endereço: {p.endereco || "Não informado"}</Typography>
                <Typography variant="body2">Resíduos aceitos: Vidro, Papel, Metais e Plástico</Typography>
                <Typography variant="body2" color={p.operacional ? "success.main" : "error.main"}>
                  {p.operacional ? "Operacional" : "Inoperante"}
                </Typography>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Painel lateral */}
      <Box
        sx={{
          width: "220px",
          ml: 3,
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          borderRadius: 2,
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          backgroundColor: "background.paper",
          borderLeft: "2px solid #ccc",
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          Painel de PEVs
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center", mb: 1 }}>
          Use os modos abaixo para adicionar ou excluir PEVs.
        </Typography>

        <Button
          variant={modo === "adicao" ? "contained" : "outlined"}
          onClick={() => setModo("adicao")}
          sx={{
            backgroundColor: modo === "adicao" ? "success.main" : undefined,
            color: modo === "adicao" ? "white" : "success.main",
            borderColor: "success.main",
          }}
        >
          Adicionar PEV
        </Button>
        <Button
          variant={modo === "exclusao" ? "contained" : "outlined"}
          onClick={() => setModo("exclusao")}
          sx={{
            backgroundColor: modo === "exclusao" ? "error.main" : undefined,
            color: modo === "exclusao" ? "white" : "error.main",
            borderColor: "error.main",
          }}
        >
          Excluir PEV
        </Button>
        <Button variant="outlined" onClick={() => setModo("visualizacao")} color="inherit">
          Cancelar
        </Button>
      </Box>

      {/* Modal para adicionar novo PEV */}
      <Dialog open={!!novoPonto} onClose={() => setNovoPonto(null)}>
        <DialogTitle>Adicionar PEV</DialogTitle>
        <Grid container spacing={2}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nome do PEV"
              color="success"
              value={nomePonto}
              onChange={(e) => setNomePonto(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Endereço"
              color="success"
              value={enderecoPonto}
              onChange={(e) => setEnderecoPonto(e.target.value)}
            />
            {/* Modal para adicionar novo PEV */}
            <Dialog open={!!novoPonto} onClose={() => setNovoPonto(null)}>
              <DialogTitle>Adicionar PEV</DialogTitle>
              <Grid container spacing={2}>
                <DialogContent>
                  <TextField
                    fullWidth
                    label="Nome do PEV"
                    color="success"
                    value={nomePonto}
                    onChange={(e) => setNomePonto(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Endereço"
                    color="success"
                    value={enderecoPonto}
                    onChange={(e) => setEnderecoPonto(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Latitude"
                    color="success"
                    value={novoPonto?.lat ?? ""}
                    onChange={(e) =>
                      setNovoPonto((prev) => ({
                        lat: parseFloat(e.target.value) || 0,
                        lng: prev?.lng ?? 0,
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Longitude"
                    color="success"
                    value={novoPonto?.lng ?? ""}
                    onChange={(e) =>
                      setNovoPonto((prev) => ({
                        lat: prev?.lat ?? 0,
                        lng: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </DialogContent>
              </Grid>
              <DialogActions>
                <Button onClick={() => setNovoPonto(null)} color="inherit">
                  Cancelar
                </Button>
                <Button onClick={handleSalvarPonto} variant="contained" color="success">
                  Salvar
                </Button>
              </DialogActions>
            </Dialog>
          </DialogContent>
        </Grid>
        <DialogActions>
          <Button onClick={() => setNovoPonto(null)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSalvarPonto} variant="contained" color="success">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={!!pontoExclusao} onClose={() => setPontoExclusao(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o PEV <strong>{pontoExclusao?.nome}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPontoExclusao(null)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (pontoExclusao) {
                await handleExcluirPonto(pontoExclusao.id);
                setPontoExclusao(null);
              }
            }}
            variant="contained"
            color="error"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar PEV */}
      <Dialog open={!!pontoEdicao} onClose={() => setPontoEdicao(null)}>
        <DialogTitle>Editar PEV</DialogTitle>
        <Grid container spacing={2}>
          <DialogContent>
            {/* Nome agora é editável */}
            <TextField
              fullWidth
              label="Nome do PEV"
              color="success"
              value={pontoEdicao?.nome ?? ""}
              onChange={(e) =>
                setPontoEdicao((prev) => (prev ? { ...prev, nome: e.target.value } : prev))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Endereço"
              color="success"
              value={pontoEdicao?.endereco ?? ""}
              onChange={(e) =>
                setPontoEdicao((prev) => (prev ? { ...prev, endereco: e.target.value } : prev))
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pontoEdicao?.operacional ?? true}
                  color="success"
                  onChange={(e) =>
                    setPontoEdicao((prev) => (prev ? { ...prev, operacional: e.target.checked } : prev))
                  }
                />
              }
              label="Operacional"
            />
          </DialogContent>
        </Grid>
        <DialogActions>
          <Button onClick={() => setPontoEdicao(null)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSalvarEdicao} variant="contained" color="success">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={!!feedback}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={feedback?.tipo ?? "success"}
          variant="filled"
          onClose={() => setFeedback(null)}
        >
          {feedback?.mensagem ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}