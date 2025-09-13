'use client';

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
} from "@mui/material";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

// Lista fixa de bairros e turnos
const BAIRROS = ["02 De agosto", "Açude Velho", "Alto Tiradentes", "Bento Pereira", 
  "Campo De Aviação", "Centro", "DNOCS", "Girilândia", "Granville", "Nova Morada", 
  "Parque De Exposição", "Pedra E Cal", "Populares", "PROURB", "São Francisco", "São José", "Várzea", "Vazantes"];
const TURNOS = ["Manhã", "Tarde"] as const;

// Definindo tipos para maior segurança
type Turno = typeof TURNOS[number];

interface BairroColeta {
  nome: string;
  turno: Turno;
}

interface AgendamentoMatrix {
  [bairro: string]: {
    [turno in Turno]: boolean;
  };
}

interface EventData {
  id: string;
  bairros: BairroColeta[];
}

export function ColetasCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [modalNovoEventoOpen, setModalNovoEventoOpen] = useState(false);
  const [modalEventoExistenteOpen, setModalEventoExistenteOpen] = useState(false);

  const [agendamento, setAgendamento] = useState<AgendamentoMatrix>({});
  
  const [eventData, setEventData] = useState<EventData | null>(null);

  // Carregar eventos em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "coletas"), (snapshot) => {
      const loadedEvents: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const bairros = data.bairros as BairroColeta[] || [];
        const numBairros = bairros.length;
        loadedEvents.push({
          id: docSnap.id,
          title: `Coleta em ${numBairros} bairro${numBairros !== 1 ? 's' : ''}`,
          start: docSnap.id,
          extendedProps: { bairros },
        });
      });
      setEvents(loadedEvents);
    });
    return () => unsubscribe();
  }, []);

  // Função auxiliar para inicializar a matriz de estado
  const initializeAgendamento = (bairrosExistentes: BairroColeta[] = []) => {
    const initialState: AgendamentoMatrix = {};
    BAIRROS.forEach(bairro => {
      initialState[bairro] = {} as any;
      TURNOS.forEach(turno => {
        initialState[bairro][turno] = bairrosExistentes.some(
          item => item.nome === bairro && item.turno === turno
        );
      });
    });
    setAgendamento(initialState);
  };

  // Clique em uma data
  const handleDateClick = async (arg: { dateStr: string }) => {
    const date = arg.dateStr;
    setSelectedDate(date);

    const docRef = doc(collection(db, "coletas"), date);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      setEventData({ id: date, bairros: data.bairros as BairroColeta[] || [] });
      setModalEventoExistenteOpen(true);
    } else {
      initializeAgendamento();
      setModalNovoEventoOpen(true);
    }
  };

  // Lógica para marcar/desmarcar o checkbox
  const handleToggle = (bairro: string, turno: Turno) => {
    setAgendamento(prevAgendamento => ({
      ...prevAgendamento,
      [bairro]: {
        ...prevAgendamento[bairro],
        [turno]: !prevAgendamento[bairro][turno]
      }
    }));
  };

  // Salvar no Firestore
  const handleSave = async () => {
    if (!selectedDate) return;
    
    const bairrosParaSalvar: BairroColeta[] = [];
    Object.keys(agendamento).forEach(bairro => {
      TURNOS.forEach(turno => {
        if (agendamento[bairro][turno]) {
          bairrosParaSalvar.push({ nome: bairro, turno });
        }
      });
    });

    if (bairrosParaSalvar.length === 0) {
      alert("Selecione pelo menos um bairro e turno.");
      return;
    }

    try {
      await setDoc(doc(db, "coletas", selectedDate), { bairros: bairrosParaSalvar });
    } catch (e) {
      console.error("Erro ao salvar o agendamento: ", e);
    }
    
    setModalNovoEventoOpen(false);
  };

  // Excluir evento
  const handleDelete = async () => {
    if (!eventData) return;
    await deleteDoc(doc(db, "coletas", eventData.id));
    setModalEventoExistenteOpen(false);
  };

  // Editar evento -> abre modal de criação preenchido
  const handleEdit = () => {
    if (!eventData) return;
    initializeAgendamento(eventData.bairros || []);
    setModalEventoExistenteOpen(false);
    setModalNovoEventoOpen(true);
  };

  // Clique em um evento existente no calendário
  const handleEventClick = (arg: any) => {
    const data = arg.event.extendedProps;
    setEventData({ id: arg.event.id, bairros: data.bairros });
    setModalEventoExistenteOpen(true);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="720px"
        locale="pt"
        buttonText= {{today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' }}
      />

      {/* Modal de novo evento/edição */}
      <Dialog open={modalNovoEventoOpen} onClose={() => setModalNovoEventoOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Selecionar Bairros e Turnos</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Marque os turnos de coleta para cada bairro.
          </Typography>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Bairro</TableCell>
                  {TURNOS.map(turno => (
                    <TableCell key={turno} align="center">{turno}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {BAIRROS.map(bairro => (
                  <TableRow key={bairro}>
                    <TableCell component="th" scope="row">
                      {bairro}
                    </TableCell>
                    {TURNOS.map(turno => (
                      <TableCell key={turno} align="center">
                        <Checkbox
                          color="success"
                          checked={agendamento[bairro] ? agendamento[bairro][turno] : false}
                          onChange={() => handleToggle(bairro, turno)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalNovoEventoOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} color="success">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de evento existente */}
      <Dialog open={modalEventoExistenteOpen} onClose={() => setModalEventoExistenteOpen(false)} fullWidth>
        <DialogTitle>Coletas em {eventData?.id}</DialogTitle>
        <DialogContent>
          {eventData?.bairros?.map((b, idx) => (
            <Typography key={idx}>
              {b.nome} - {b.turno}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEdit} color="success">Editar</Button>
          <Button onClick={handleDelete} color="error">
            Apagar evento
          </Button>
          <Button onClick={() => setModalEventoExistenteOpen(false)} color="inherit">Sair</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}