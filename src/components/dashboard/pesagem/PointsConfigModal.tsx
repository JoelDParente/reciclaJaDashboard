'use client';

import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Typography
} from '@mui/material';
import { PointsConfig } from '@/models/points';
import { PointsConfigDAO } from '@/daos/pointsConfigDAO';

interface Props {
  open: boolean;
  onClose: () => void;
  config: PointsConfig | null;
  onSave: (cfg: PointsConfig) => void;
}

export function PointsConfigModal({ open, onClose, config, onSave }: Props) {
  const [localConfig, setLocalConfig] = React.useState<PointsConfig | null>(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!localConfig) return null;

  const handleChange = (field: keyof PointsConfig, value: any) => {
    setLocalConfig(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!localConfig) return;
    const dao = new PointsConfigDAO();
    await dao.saveConfig(localConfig);
    onSave(localConfig);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuração de Pontos</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Seleção do modo */}
          <Grid size={{xs:12}}>
            <TextField
              select
              label="Modo de Cálculo"
              fullWidth
              value={localConfig.mode}
              onChange={e => handleChange('mode', Number(e.target.value) as 1 | 2 | 3)}
              color='success'
            >
              <MenuItem value={1}>1 - Fixo por Solicitação</MenuItem>
              <MenuItem value={2}>2 - Fixo + Peso Total</MenuItem>
              <MenuItem value={3}>3 - Fixo + Peso por Tipo</MenuItem>
            </TextField>
          </Grid>

          {/* Pontos fixos */}
          <Grid size={{xs:12}}>
            <TextField
              type="number"
              label="Pontos Fixos"
              fullWidth
              value={localConfig.fixedPoints}
              onChange={e => handleChange('fixedPoints', Number(e.target.value))}
              color='success'
            />
          </Grid>

          {/* Extra por kg */}
          {localConfig.mode === 2 && (
            <Grid size={{xs:12}}>
              <TextField
                type="number"
                label="Pontos por Kg"
                fullWidth
                value={localConfig.pointsPerKg}
                onChange={e => handleChange('pointsPerKg', Number(e.target.value))}
              />
            </Grid>
          )}

          {/* Pesos por material */}
          {localConfig.mode === 3 && (
            <>
              <Typography variant="subtitle1" sx={{ ml: 2, mt: 1 }}>Pesos por Material</Typography>
              {Object.entries(localConfig.materialWeights || {}).map(([mat, val]) => (
                <Grid size={{xs:12}} key={mat}>
                  <TextField
                    type="number"
                    label={`Pontos por Kg de ${mat}`}
                    fullWidth
                    value={val}
                    onChange={e =>
                      setLocalConfig(prev =>
                        prev ? {
                          ...prev,
                          materialWeights: { ...prev.materialWeights, [mat]: Number(e.target.value) }
                        } : prev
                      )
                    }
                  />
                </Grid>
              ))}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="success">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
