import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  AddAPhotoRounded,
  CheckRounded,
  Delete,
  LinkRounded,
  Logout,
  PersonalVideoRounded,
  SaveRounded,
  Settings,
  TodayRounded,
} from "@mui/icons-material";
import { PROFILE_PICTURE_MAX_LENGTH, USER_NAME_MAX_LENGTH } from "../constants";
import { SettingsDialog, TopBar } from "../components";
import { ColorElement, ColorPalette, DialogBtn, Themes } from "../styles";
import { defaultUser } from "../constants/defaultUser";
import { UserContext } from "../contexts/UserContext";
import { timeAgo, getFontColor, showToast } from "../utils";
import { useSystemTheme } from "../hooks/useSystemTheme";

const UserSettings = () => {
  const { user, setUser } = useContext(UserContext);
  const { name, profilePicture, createdAt } = user;
  const [userName, setUserName] = useState<string>("");
  const [profilePictureURL, setProfilePictureURL] = useState<string>("");
  const [openChangeImage, setOpenChangeImage] = useState<boolean>(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState<boolean>(false);
  const [openSettings, setOpenSettings] = useState<boolean>(false);

  const systemTheme = useSystemTheme();

  useEffect(() => {
    document.title = `Task Pro - User ${name ? `(${name})` : ""}`;
  }, [name]);

  const handleSaveName = () => {
    if (userName.length <= USER_NAME_MAX_LENGTH && userName !== name) {
      setUser({ ...user, name: userName });

      showToast(
        <div>
          Cambio de nombre de usuario
          {userName && (
            <>
              {" "}
              a <b>{userName}</b>
            </>
          )}
          .
        </div>
      );

      setUserName("");
    }
  };

  const handleOpenImageDialog = () => {
    setOpenChangeImage(true);
  };
  const handleCloseImageDialog = () => {
    setOpenChangeImage(false);
  };

  const handleLogoutConfirmationClose = () => {
    setLogoutConfirmationOpen(false);
  };
  const handleLogout = () => {
    setUser(defaultUser);
    handleLogoutConfirmationClose();
    showToast("Ha cerrado la sesión correctamente.");
  };

  const handleSaveImage = () => {
    if (
      profilePictureURL.length <= PROFILE_PICTURE_MAX_LENGTH &&
      profilePictureURL.startsWith("https://")
    ) {
      handleCloseImageDialog();
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: profilePictureURL,
      }));
      showToast("Imagen de perfil modificada.");
    }
  };

  return (
    <>
      <TopBar title="Pérfil de Usuario" />
      <Container>
        <Tooltip title="Configuración de App">
          <IconButton
            onClick={() => setOpenSettings(true)}
            aria-label="Configuración"
            size="large"
            sx={{
              position: "absolute",
              top: "24px",
              right: "24px",
            }}
          >
            <Settings fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title={profilePicture ? "Cambiar imagen de pérfil" : "Agregar imagen de pérfil"}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Avatar
                onClick={handleOpenImageDialog}
                sx={{
                  background: "#9c9c9c81",
                  backdropFilter: "blur(10px)",
                  cursor: "pointer",
                }}
              >
                <AddAPhotoRounded />
              </Avatar>
            }
          >
            <Avatar
              onClick={handleOpenImageDialog}
              src={(profilePicture as string) || undefined}
              sx={{
                width: "96px",
                height: "96px",
                cursor: "pointer",
                fontSize: "45px",
              }}
            >
              {!profilePicture && userName
                ? userName[0].toUpperCase()
                : !user.profilePicture && !userName && name
                ? name[0].toUpperCase()
                : undefined}
            </Avatar>
          </Badge>
        </Tooltip>
        <UserName translate={name ? "no" : "yes"}>{name || "Usuario"}</UserName>
        <Tooltip
          title={new Intl.DateTimeFormat(navigator.language, {
            dateStyle: "full",
            timeStyle: "medium",
          }).format(new Date(createdAt))}
        >
          <CreatedAtDate>
            <TodayRounded fontSize="small" />
            &nbsp;Registrado {timeAgo(createdAt)}
          </CreatedAtDate>
        </Tooltip>
        <Grid
          container
          maxWidth="300px"
          marginBottom="6px"
          marginTop="1px"
          display="flex"
          justifyContent="left"
          alignItems="center"
          gap={1}
          sx={{ background: "#d9d9d9", padding: "10px", borderRadius: "32px", overflowY: "auto" }}
        >
          <Grid item>
            <Tooltip title={`System (${systemTheme})`}>
              <ColorElement
                clr={systemTheme === "dark" ? "#3d3e59" : "#ffffff"}
                style={{ transition: ".3s background" }}
                size="40px"
                onClick={() => {
                  setUser((prevUser) => ({
                    ...prevUser,
                    theme: "system",
                  }));
                }}
              >
                <Badge badgeContent={user.theme === "system" ? <CheckIcon /> : undefined}>
                  <PersonalVideoRounded
                    sx={{ color: systemTheme === "dark" ? "white" : "black" }}
                  />
                </Badge>
              </ColorElement>
            </Tooltip>
          </Grid>
          {Themes.map((theme) => (
            <Grid key={theme.name}>
              <Tooltip title={theme.name[0].toUpperCase() + theme.name.replace(theme.name[0], "")}>
                <ColorElement
                  clr={theme.MuiTheme.palette.primary.main}
                  secondClr={theme.MuiTheme.palette.secondary.main}
                  aria-label={`Cambiar tema - ${theme.name}`}
                  size="40px"
                  onClick={() => {
                    setUser((prevUser) => ({
                      ...prevUser,
                      theme: theme.name,
                    }));
                  }}
                >
                  <Badge badgeContent={user.theme === theme.name ? <CheckIcon /> : undefined}>
                    <div style={{ width: "24px", height: "24px" }} />
                  </Badge>
                </ColorElement>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <TextField
          sx={{ width: "300px" }}
          label={name === null ? "Agregar Nombre" : "Cambiar Nombre"}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
          error={userName.length > USER_NAME_MAX_LENGTH || (userName === name && name !== "")}
          helperText={
            userName.length > USER_NAME_MAX_LENGTH
              ? `El nombre supera los ${USER_NAME_MAX_LENGTH} caracteres.`
              : userName.length > 0 && userName !== name
              ? `${userName.length}/${USER_NAME_MAX_LENGTH}`
              : userName === name && name !== ""
              ? "El nuevo nombre de usuario coincide con el antiguo."
              : ""
          }
          autoComplete="nickname"
        />

        <SaveBtn
          onClick={handleSaveName}
          disabled={userName.length > USER_NAME_MAX_LENGTH || userName === name}
        >
          Guardar nombre
        </SaveBtn>
        <Button
          color="error"
          variant="outlined"
          sx={{ p: "12px 20px", borderRadius: "14px", marginTop: "8px" }}
          onClick={() => setLogoutConfirmationOpen(true)}
        >
          <Logout />
          &nbsp; Salir
        </Button>
      </Container>
      <Dialog open={openChangeImage} onClose={handleCloseImageDialog}>
        <DialogTitle>Cambiar la imagen del perfil</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Link de imagen de perfil"
            placeholder="Enlace de la imagen..."
            sx={{ my: "8px", width: "300px" }}
            value={profilePictureURL}
            onChange={(e) => {
              setProfilePictureURL(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSaveImage()}
            error={profilePictureURL.length > PROFILE_PICTURE_MAX_LENGTH}
            helperText={
              profilePictureURL.length > PROFILE_PICTURE_MAX_LENGTH
                ? `URL es demasiado larga máximo ${PROFILE_PICTURE_MAX_LENGTH} caracteres.`
                : ""
            }
            autoComplete="url"
            type="url"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkRounded />
                </InputAdornment>
              ),
            }}
          />
          <br />
          {profilePicture !== null && (
            <Button
              fullWidth
              onClick={() => {
                handleCloseImageDialog();
                showToast("Imagen de perfil eliminada.");
                setUser({ ...user, profilePicture: null });
              }}
              color="error"
              variant="outlined"
              sx={{ margin: "16px 0", p: "12px 20px", borderRadius: "14px" }}
            >
              <Delete /> &nbsp; Eliminar Imagen
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <DialogBtn onClick={handleCloseImageDialog}>Cancerlar</DialogBtn>
          <DialogBtn
            disabled={
              profilePictureURL.length > PROFILE_PICTURE_MAX_LENGTH ||
              !profilePictureURL.startsWith("https://")
            }
            onClick={handleSaveImage}
          >
            <SaveRounded /> &nbsp; Guardar
          </DialogBtn>
        </DialogActions>
      </Dialog>
      <Dialog open={logoutConfirmationOpen} onClose={handleLogoutConfirmationClose}>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to logout? <b>Your tasks will not be saved.</b>
        </DialogContent>
        <DialogActions>
          <DialogBtn onClick={handleLogoutConfirmationClose}>Cancel</DialogBtn>
          <DialogBtn onClick={handleLogout} color="error">
            Logout
          </DialogBtn>
        </DialogActions>
      </Dialog>
      <SettingsDialog open={openSettings} onClose={() => setOpenSettings(false)} />
    </>
  );
};

export default UserSettings;
const Container = styled.div`
  margin: 0 auto;
  max-width: 400px;
  padding: 64px 48px;
  border-radius: 48px;
  box-shadow: 0px 4px 50px rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  color: ${ColorPalette.fontDark};
  transition: border 0.3s;
  border: 4px solid ${({ theme }) => theme.primary};
  box-shadow: 0 0 72px -1px ${({ theme }) => theme.primary + "bf"};
  display: flex;
  gap: 14px;
  flex-direction: column;
  align-items: center;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const CheckIcon = styled(CheckRounded)`
  font-size: 18px;
  padding: 2px;
  color: white;
  background: #141414;
  border-radius: 100px;
`;

const SaveBtn = styled(Button)`
  width: 300px;
  font-weight: 600;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => getFontColor(theme.primary)};
  font-size: 18px;
  padding: 14px;
  border-radius: 16px;
  cursor: pointer;
  text-transform: capitalize;
  &:hover {
    background: ${({ theme }) => theme.primary};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    color: white;
  }
`;

const UserName = styled.span`
  font-size: 20px;
  font-weight: 500;
`;

const CreatedAtDate = styled.span`
  display: flex;
  align-items: center;
  font-style: italic;
  font-weight: 400;
  opacity: 0.8;
  margin-top: -5px;
  margin-bottom: 2px;
  // fix for browser translate
  & font {
    margin: 0 1px;
  }
`;
