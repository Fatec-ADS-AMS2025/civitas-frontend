const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string) => {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) return "Informe o e-mail";
  if (!EMAIL_PATTERN.test(normalizedEmail)) return "Informe um e-mail válido";

  return "";
};

export const validateName = (name: string) => {
  const normalizedName = name.trim();

  if (!normalizedName) return "Informe o nome";
  if (normalizedName.length < 3) return "O nome deve ter pelo menos 3 caracteres";
  if (normalizedName.length > 150) return "O nome deve ter no máximo 150 caracteres";

  return "";
};

export const validatePassword = (password: string) => {
  if (!password) return "Informe a senha";
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "A senha deve conter pelo menos uma letra e um número";
  }

  return "";
};

export const validatePasswordConfirmation = (password: string, confirmation: string) => {
  if (!confirmation) return "Confirme a senha";
  if (password !== confirmation) return "As senhas nao coincidem";

  return "";
};
