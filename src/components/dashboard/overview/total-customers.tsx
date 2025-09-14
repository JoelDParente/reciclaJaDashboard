"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { UserService } from "@/services/userService";

export function TotalCustomers(): React.JSX.Element {
  const [total, setTotal] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchTotal = async () => {
      try {
        const totalUsers = await UserService.getTotalUsers();
        setTotal(totalUsers);
      } catch (error) {
        console.error("Erro ao buscar total de usuários:", error);
      }
    };

    fetchTotal();
  }, []);

  return (
    <Card>
      <CardContent
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        borderRadius: "10px",
      }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Usuários Cadastrados
              </Typography>
              <Typography variant="h4">{total}</Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-info-main)",
                height: "56px",
                width: "56px",
              }}
            >
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}