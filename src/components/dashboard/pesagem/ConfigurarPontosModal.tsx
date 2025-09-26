'use client';

import * as React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
} from '@mui/material';

interface ConfiguracaoPontos {
  fixo: number;
  plastico: number;
  papel: number;
  vidro: number;
  metal: number;
  outros: number;
}

interface ConfigurarPontosModalProps {
  open: boolean;
  onClose: () => void;
  valores: ConfiguracaoPontos;
  onSave: (valores: ConfiguracaoPontos) => void;
}

export function ConfigurarPontosModal({
  open,
  onClose,
  valores,
  onSave,
}: ConfigurarPontosModalProps) {
  const [config, setConfig] = React.useState<ConfiguracaoPontos>(valores);

  React.useEffect(() => {
    setConfig(valores); // sincroniza sempre que mudar o default
  }, [valores]);

  const handleChange = (campo: keyof ConfiguracaoPontos, value: number) => {
    setConfig((prev) => ({ ...prev, [campo]: value }));
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" mb={2}>
          Configurar Pontos
        </Typography>
        <Grid container spacing={2}>
          {Object.keys(config).map((key) => (
            <Grid sx={{xs:6}} key={key}>
              <TextField
                fullWidth
                type="number"
                label={key[0].toUpperCase() + key.slice(1)}
                value={config[key as keyof ConfiguracaoPontos]}
                onChange={(e) =>
                  handleChange(
                    key as keyof ConfiguracaoPontos,
                    Number(e.target.value)
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}