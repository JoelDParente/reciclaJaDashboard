'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  firstName: zod.string().min(1, { message: 'Nome é obrigatório' }),
  lastName: zod.string().min(1, { message: 'Sobrenome é obrigatório' }),
  email: zod.string().min(1, { message: 'Email é obrigatório' }).email(),
  password: zod.string().min(6, { message: 'A senha deve ter mais de 6 caracteres' }),
  terms: zod.boolean().refine((value) => value, 'Você deve aceitar os termos de privacidade'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', lastName: '', email: '', password: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.signUp(values);

      if (error) {
        setError('root', { type: 'server', message: error });
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

      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Cadastro</Typography>
          <Typography color="text.secondary" variant="body2">
            Já possui uma conta?{' '}
            <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2" color="success">
              Login
            </Link>
          </Typography>
        </Stack>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.firstName)}
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
                  <InputLabel>Nome</InputLabel>
                  <OutlinedInput {...field} label="Nome" />
                  {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.firstName)}
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
                  <InputLabel>Sobrenome</InputLabel>
                  <OutlinedInput {...field} label="Sobrenome" />
                  {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
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
                  <OutlinedInput {...field} label="Email" type="email" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
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
                  <OutlinedInput {...field} label="Senha" type="password" />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <div>
                  <FormControlLabel
                    control={<Checkbox {...field} color="success" />}
                    label={
                      <React.Fragment>
                        Confirmo que li os <Link color="success">termos de privacidade.</Link>
                      </React.Fragment>
                    }
                  />
                  {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
                </div>
              )}
            />
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            <Button disabled={isPending} type="submit" variant="contained" color="success">
              Cadastrar
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}
