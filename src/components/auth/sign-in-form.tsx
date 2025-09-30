'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email é obrigatório' }).email(),
  password: zod.string().min(1, { message: 'Senha é obrigatória' }),
});

type Values = zod.infer<typeof schema>;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

 const onSubmit = React.useCallback(
  async (values: Values): Promise<void> => {
    setIsPending(true);

    const { error } = await authClient.signInWithPassword(values);

    if (error) {
      // Mensagem amigável
      let friendlyMessage = 'Não foi possível fazer login. Verifique seu email e senha.';
      
      // Exemplo: se quiser tratar casos específicos do Firebase
      if (error.includes('user-not-found')) {
        friendlyMessage = 'Usuário não encontrado. Verifique seu email.';
      } else if (error.includes('invalid-password')) {
        friendlyMessage = 'Senha incorreta. Tente novamente.';
      }

      setError('root', { type: 'server', message: friendlyMessage });
      setIsPending(false);
      return;
    }

    // Refresh the auth state
    await checkSession?.();

    // UserProvider, for this case, will not refresh the router
    // After refresh, GuestGuard will handle the redirect
    router.refresh();
  },
  [checkSession, router, setError]
);


  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: 2,
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",                 // sombra opcional
      }}
    >
      <Stack spacing={4}>
        <Stack spacing={1}>

          <Typography variant="h4" style={{textAlign:"center", color:"success.main"}}>Login</Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)} >
          <Stack spacing={2}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)}
                  sx={{
                    "& label.Mui-focused": {
                      color: "success.main", // muda a cor do label no foco
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "success.main", // muda a borda no foco
                      },
                    },
                  }}
                >
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput {...field}
                    value={field.value ?? ""}
                    color="success"
                    label="Email"
                    type="email" />
                  {errors.email ? <FormHelperText>Email ou senha incorretos</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <FormControl error={Boolean(errors.password)}
                  sx={{
                    "& label.Mui-focused": {
                      color: "success.main", // muda a cor do label no foco
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "success.main", // muda a borda no foco
                      },
                    },
                  }}
                >
                  <InputLabel>Senha</InputLabel>
                  <OutlinedInput
                    {...field} color="success"
                    value={field.value ?? ""}
                    endAdornment={
                      showPassword ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => {
                            setShowPassword(false);
                          }}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => {
                            setShowPassword(true);
                          }}
                        />
                      )
                    }
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                  />
                  {errors.password ? <FormHelperText>Senha Incorreta</FormHelperText> : null}
                </FormControl>
              )}
            />
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            <Button disabled={isPending} type="submit" variant="contained" color="success">
              Login
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}
