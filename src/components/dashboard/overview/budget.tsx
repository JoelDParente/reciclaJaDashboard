"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack"; 
import Typography from "@mui/material/Typography";
import { BellRinging } from "@phosphor-icons/react/dist/ssr/BellRinging";
import { SolicitacaoService } from "@/services/solicitacaoService";

export function Budget(): React.JSX.Element {
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = SolicitacaoService.listenTotalSolicitacoes(setTotal);
    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Solicitações de Coleta
              </Typography>
              <Typography variant="h4">{total}</Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-primary-main)",
                height: "56px",
                width: "56px",
              }}
            >
              <BellRinging fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}