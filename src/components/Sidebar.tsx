import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  SwipeableDrawer,
  Tooltip,
} from "@mui/material";
import styled from "@emotion/styled";
import {
  AddRounded,
  CategoryRounded,
  DeleteForeverRounded,
  Favorite,
  FiberManualRecord,
  GetAppRounded,
  Logout,
  SettingsRounded,
  TaskAltRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { defaultUser } from "../constants/defaultUser";
import { SettingsDialog } from ".";
import logo from "../assets/logo256.png";
import { ColorPalette, DialogBtn, pulseAnimation, ring } from "../styles";
import { UserContext } from "../contexts/UserContext";
import { iOS } from "../utils/iOS";
import { fetchGitHubInfo } from "../services/githubApi";
import { showToast, timeAgo } from "../utils";

export const ProfileSidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const n = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState<boolean>(false);
  const [openSettings, setOpenSettings] = useState<boolean>(false);

  const [] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [] = useState<number | null>(null);

  const [] = useState<number | null>(null);

  useEffect(() => {
    const fetchRepoInfo: () => Promise<void> = async () => {
      try {
        const { repoData, branchData } = await fetchGitHubInfo();
        (repoData.stargazers_count);
        setLastUpdate(branchData.commit.commit.committer.date);
        (repoData.open_issues_count);
      } catch (error) {
        console.error(error);
      }
    };

    
  
    fetchRepoInfo();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutConfirmationOpen = () => {
    setLogoutConfirmationOpen(true);
    setAnchorEl(null);
  };

  const handleLogoutConfirmationClose = () => {
    setLogoutConfirmationOpen(false);
  };

  const handleLogout = () => {
    setUser(defaultUser);
    handleLogoutConfirmationClose();
    showToast("Ha cerrado la sesión correctamente");
  };

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: ReadonlyArray<string>;
    readonly userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  const [ ] = useState<boolean>(false);
  const [ ] = useState<BeforeInstallPromptEvent | null>(null);
  const [ ] = useState<boolean>(false);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      (true);
    };

    const detectAppInstallation = () => {
      window.matchMedia("(display-mode: standalone)").addEventListener("change", (e) => {
        (e.matches);
      });
    };

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    detectAppInstallation();

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    };
  }, []);



  return (
    <Container>
      <Tooltip title={<div translate={user.name ? "no" : "yes"}>{user.name || "Usuario"}</div>}>
        <IconButton
          aria-label="Sidebar"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ zIndex: 1 }}
        >
          <Avatar
            src={(user.profilePicture as string) || undefined}
            alt={user.name || "User"}
            onError={() => {
              setUser((prevUser) => ({
                ...prevUser,
                profilePicture: null,
              }));

              showToast("Error in profile picture URL", { type: "error" });
              throw new Error("Error in profile picture URL");
            }}
            sx={{
              width: "52px",
              height: "52px",
              background: user.profilePicture ? "#ffffff1c" : "#747474",
              transition: ".2s all",
              fontSize: "26px",
            }}
          >
            {user.name ? user.name[0].toUpperCase() : undefined}
          </Avatar>
        </IconButton>
      </Tooltip>
      <StyledSwipeableDrawer
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        id="basic-menu"
        anchor="right"
        open={open}
        onOpen={() => console.log("")}
        onClose={handleClose}
      >
        <LogoContainer
          translate="no"
          onClick={() => {
            n("/");
            handleClose();
          }}
        >
          <Logo src={logo} alt="logo" />
          <h2>
            <span style={{ color: "#7764E8" }}>Task</span> Pro
            <span style={{ color: "#7764E8" }}>.</span>
          </h2>
        </LogoContainer>

        <StyledMenuItem
          onClick={() => {
            n("/");
            handleClose();
          }}
        >
          <TaskAltRounded /> &nbsp; Tareas
          {user.tasks.filter((task) => !task.done).length > 0 && (
            <Tooltip title={`${user.tasks.filter((task) => !task.done).length} tasks to do`}>
              <MenuLabel>
                {user.tasks.filter((task) => !task.done).length > 99
                  ? "99+"
                  : user.tasks.filter((task) => !task.done).length}
              </MenuLabel>
            </Tooltip>
          )}
        </StyledMenuItem>

        <StyledMenuItem
          onClick={() => {
            n("/add");
            handleClose();
          }}
        >
          <AddRounded /> &nbsp; Agregar Tareas
        </StyledMenuItem>

        <StyledMenuItem
          onClick={() => {
            n("/purge");
            handleClose();
          }}
        >
          <DeleteForeverRounded /> &nbsp; Eliminar Tareas
        </StyledMenuItem>

        {user.settings[0].enableCategories !== undefined && user.settings[0].enableCategories && (
          <StyledMenuItem
            onClick={() => {
              n("/categories");
              handleClose();
            }}
          >
            <CategoryRounded /> &nbsp; Categorias
          </StyledMenuItem>
        )}

        <StyledMenuItem
          onClick={() => {
            n("/transfer");
            handleClose();
          }}
        >
          <GetAppRounded /> &nbsp; Transferir
        </StyledMenuItem>

        <StyledDivider />
      

        


      

        

        <StyledMenuItem onClick={handleLogoutConfirmationOpen} sx={{ color: "#ff4040 !important" }}>
          <Logout /> &nbsp; Salir
        </StyledMenuItem>

        <ProfileOptionsBottom
          isMobile={
            window.matchMedia("(display-mode: standalone)").matches &&
            /Mobi/.test(navigator.userAgent)
          }
        >
          <SettingsMenuItem
            onClick={() => {
              setOpenSettings(true);
              handleClose();
            }}
          >
            <SettingsRounded /> &nbsp; Configuraciones
            {user.settings[0] === defaultUser.settings[0] && <PulseMenuLabel />}
          </SettingsMenuItem>
          <StyledDivider />
          <StyledMenuItem
            translate={user.name ? "no" : "yes"}
            onClick={() => {
              n("/user");
              handleClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#d7d7d7",
            }}
          >
            <Avatar
              src={(user.profilePicture as string) || undefined}
              sx={{ width: "44px", height: "44px" }}
            >
              {user.name ? user.name[0].toUpperCase() : undefined}
            </Avatar>
            <h4 style={{ margin: 0, fontWeight: 600 }}> {user.name || "Ususario"}</h4>{" "}
            {(user.name === null || user.name === "") &&
              user.profilePicture === null &&
              user.theme! == defaultUser.theme && <PulseMenuLabel />}
          </StyledMenuItem>
          <StyledDivider />
          <CreditsContainer>
            {lastUpdate && (
              <Tooltip title={timeAgo(new Date(lastUpdate))}>
                <span>
                  ¡De 🇵🇪 para todo el 🌎!
                </span>
              </Tooltip>
            )}
          </CreditsContainer>
          <CreditsContainer translate="no">
          
            <span style={{ display: "flex", alignItems: "center" }}>
              By. &nbsp;
              <Favorite sx={{ fontSize: "14px" }} />
            </span>
            <span style={{ marginLeft: "6px", marginRight: "4px" }}></span>
            <a
              style={{ textDecoration: "none", color: "inherit" }}
              href="https://github.com/andersonvictor"
            >
             Anderson Romero
            </a>
          </CreditsContainer>
          <CreditsContainer>
            {lastUpdate && (
              <Tooltip title={timeAgo(new Date(lastUpdate))}>
                <span>
                  Ultima actualización:{" "}
                  {new Intl.DateTimeFormat(navigator.language, {
                    dateStyle: "long",
                    timeStyle: "medium",
                  }).format(new Date(lastUpdate))}
                </span>
              </Tooltip>
            )}
          </CreditsContainer>
        </ProfileOptionsBottom>
      </StyledSwipeableDrawer>

      <Dialog open={logoutConfirmationOpen} onClose={handleLogoutConfirmationClose}>
        <DialogTitle>Confirmar Cierre de Sesión</DialogTitle>
        <DialogContent>
          Seguro de cerrar sesión? <b>Sus tareas no se guardarán.</b>
        </DialogContent>
        <DialogActions>
          <DialogBtn onClick={handleLogoutConfirmationClose}>Cancelar</DialogBtn>
          <DialogBtn onClick={handleLogout} color="error">
            Salir
          </DialogBtn>
        </DialogActions>
      </Dialog>
      <SettingsDialog open={openSettings} onClose={() => setOpenSettings(!openSettings)} />
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  right: 16vw;
  top: 14px;
  z-index: 900;
  @media (max-width: 1024px) {
    right: 16px;
  }
`;

const StyledSwipeableDrawer = styled(SwipeableDrawer)`
  & .MuiPaper-root {
    border-radius: 24px 0 0 0;
    min-width: 300px;
    box-shadow: none;
    padding: 4px;
    background: #f9fafc;
    z-index: 999;

    @media (min-width: 1920px) {
      min-width: 320px;
    }

    @media (max-width: 1024px) {
      min-width: 280px;
    }

    @media (max-width: 600px) {
      min-width: 56vw;
    }
  }
`;

const StyledMenuItem = styled(MenuItem)`
  margin: 0px 8px;
  padding: 16px 12px;
  border-radius: 14px;
  box-shadow: none;
  display: flex;
  font-weight: 500;
  color: #101727;
  align-items: center;
  gap: 6px;

  & svg,
  .bmc-icon {
    transition: 0.4s transform;
  }

  &:hover {
    background-color: #f0f0f0;
    & svg[data-testid="GitHubIcon"] {
      transform: rotateY(${2 * Math.PI}rad);
    }
    & svg[data-testid="BugReportRoundedIcon"] {
      transform: rotate(45deg) scale(0.9) translateY(-20%);
    }
    & .bmc-icon {
      animation: ${ring} 2.5s ease-in alternate;
    }
  }
`;

const SettingsMenuItem = styled(StyledMenuItem)`
  background: #101727;
  color: ${ColorPalette.fontLight} !important;
  margin-top: 8px !important;
  &:hover {
    background: #101727db !important;
    & svg[data-testid="SettingsRoundedIcon"] {
      transform: rotate(180deg);
    }
  }
`;

const MenuLabel = styled.span<{ clr?: string }>`
  margin-left: auto;
  font-weight: 600;
  background: ${({ clr, theme }) => (clr || theme.primary) + "35"};
  color: ${({ clr, theme }) => clr || theme.primary};
  padding: 2px 12px;
  border-radius: 32px;
  font-size: 14px;
`;

const StyledDivider = styled(Divider)`
  margin: 0 8px;
`;

const PulseMenuLabel = styled(MenuLabel)`
  animation: ${({ theme }) => pulseAnimation(theme.primary, 6)} 1.2s infinite;
  padding: 6px;
  margin-right: 4px;
`;

PulseMenuLabel.defaultProps = {
  children: (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FiberManualRecord style={{ fontSize: "16px" }} />
    </div>
  ),
};

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-top: 8px;
  margin-bottom: 16px;
  gap: 16px;
  cursor: pointer;
`;


const Logo = styled.img`
  width: 52px;
  margin-left: 18px;
  border-radius: 14px;
`;

const ProfileOptionsBottom = styled.div<{ isMobile: boolean }>`
  margin-top: auto;
  margin-bottom: ${({ isMobile }) => (isMobile ? "38px" : "16px")};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CreditsContainer = styled.div`
  font-size: 12px;
  margin: 0;
  color: #101727c0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;
