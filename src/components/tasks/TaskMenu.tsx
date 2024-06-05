import {
  Cancel,
  Close,
  ContentCopy,
  ContentCopyRounded,
  DeleteRounded,
  Done,
  DownloadRounded,
  EditRounded,
  IosShare,
  LaunchRounded,
  LinkRounded,
  Pause,
  PlayArrow,
  PushPinRounded,
  QrCode2Rounded,
  RadioButtonChecked,
  RecordVoiceOver,
  RecordVoiceOverRounded,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { BottomSheet } from "react-spring-bottom-sheet";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import styled from "@emotion/styled";
import "react-spring-bottom-sheet/dist/style.css";
import { useResponsiveDisplay } from "../../hooks/useResponsiveDisplay";
import { ColorPalette, DialogBtn } from "../../styles";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../../contexts/UserContext";
import QRCode from "react-qr-code";
import { Task, UUID } from "../../types/user";
import { calculateDateDifference, saveQRCode, showToast } from "../../utils";
import Marquee from "react-fast-marquee";
import { TaskIcon } from "..";

interface TaskMenuProps {
  selectedTaskId: UUID | null;
  selectedTasks: UUID[];
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: null | HTMLElement;
  handleDeleteTask: () => void;
  handleCloseMoreMenu: () => void;
  handleSelectTask: (taskId: UUID) => void;
}

export const TaskMenu: React.FC<TaskMenuProps> = ({
  selectedTaskId,
  selectedTasks,
  setEditModalOpen,
  anchorEl,
  handleDeleteTask,
  handleCloseMoreMenu,
  handleSelectTask,
}) => {
  const { user, setUser } = useContext(UserContext);
  const { tasks, name, settings, emojisStyle } = user;
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [shareTabVal, setShareTabVal] = useState<number>(0);
  const isMobile = useResponsiveDisplay();
  const n = useNavigate();

  const redirectToTaskDetails = () => {
    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
    const taskId = selectedTask?.id.toString().replace(".", "");
    n(`/task/${taskId}`);
  };

  const generateShareableLink = (taskId: UUID | null, userName: string): string => {
    const task = tasks.find((task) => task.id === taskId);

    // This removes id property from link as a new identifier is generated on the share page.
    interface TaskToShare extends Omit<Task, "id"> {
      id: undefined;
    }

    if (task) {
      const taskToShare: TaskToShare = {
        ...task,
        sharedBy: undefined,
        id: undefined,
        category: settings[0].enableCategories ? task.category : undefined,
      };
      const encodedTask = encodeURIComponent(JSON.stringify(taskToShare));
      const encodedUserName = encodeURIComponent(userName);
      return `${window.location.href}share?task=${encodedTask}&userName=${encodedUserName}`;
    }
    return "";
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    const linkToCopy = generateShareableLink(selectedTaskId, name || "User");
    try {
      await navigator.clipboard.writeText(linkToCopy);
      showToast("Link copiado al portapapeles.");
    } catch (error) {
      console.error("Error la copiar link al portapapeles", error);
      showToast("Error la copiar link al portapapeles", { type: "error" });
    }
  };

  const handleShare = () => {
    const linkToShare = generateShareableLink(selectedTaskId, name || "User");
    if (navigator.share) {
      navigator
        .share({
          title: "Compartir Tarea",
          text: `Revisa esta tarea: ${tasks.find((task) => task.id === selectedTaskId)?.name}`,
          url: linkToShare,
        })
        .catch((error) => {
          console.error("Error al compartir link:", error);
        });
    }
  };

  const handleMarkAsDone = () => {
    // Toggles the "done" property of the selected task
    if (selectedTaskId) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, done: !task.done };
        }
        return task;
      });
      setUser((prevUser) => ({
        ...prevUser,
        tasks: updatedTasks,
      }));

      const allTasksDone = updatedTasks.every((task) => task.done);

      if (allTasksDone) {
        showToast(
          <div>
            <b>Todas las tareas realizadas</b>
            <br />
            <span>Has tachado todas tus tareas pendientes. ¡Bien hecho!</span>
          </div>,
          {
            icon: (
              <div style={{ margin: "-6px 4px -6px -6px" }}>
                <TaskIcon variant="success" scale={0.18} />
              </div>
            ),
          }
        );
      }
    }
  };

  const handlePin = () => {
    // Toggles the "pinned" property of the selected task
    if (selectedTaskId) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, pinned: !task.pinned };
        }
        return task;
      });
      setUser((prevUser) => ({
        ...prevUser,
        tasks: updatedTasks,
      }));
    }
  };

  const handleDuplicateTask = () => {
    if (selectedTaskId) {
      // Close the menu
      handleCloseMoreMenu();
      // Find the selected task
      const selectedTask = tasks.find((task) => task.id === selectedTaskId);
      if (selectedTask) {
        // Create a duplicated task with a new ID and current date
        const duplicatedTask: Task = {
          ...selectedTask,
          id: crypto.randomUUID(),
          date: new Date(),
          lastSave: undefined,
        };
        // Add the duplicated task to the existing tasks
        const updatedTasks = [...tasks, duplicatedTask];
        // Update the user object with the updated tasks
        setUser((prevUser) => ({
          ...prevUser,
          tasks: updatedTasks,
        }));
      }
    }
  };

  const handleReadAloud = () => {
    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((voice) => voice.name === settings[0].voice);
    const voiceName = voices.find((voice) => voice.name === settings[0].voice);
    const voiceVolume = settings[0].voiceVolume;
    const taskName = selectedTask?.name || "";
    const taskDescription =
      selectedTask?.description?.replace(/((?:https?):\/\/[^\s/$.?#].[^\s]*)/gi, "[link]") || "";
    // Read task date in voice language
    const taskDate = new Intl.DateTimeFormat(voice ? voice.lang : navigator.language, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(selectedTask?.date || ""));

    const taskDeadline = selectedTask?.deadline
      ? ". Detalle de la Tarea: " +
        calculateDateDifference(
          new Date(selectedTask.deadline) || "",
          voice ? voice.lang : navigator.language // Read task deadline in voice language
        )
      : "";

    const textToRead = `${taskName}. ${taskDescription}. Date: ${taskDate}${taskDeadline}`;

    const utterThis: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(textToRead);

    if (voiceName) {
      utterThis.voice = voiceName;
    }

    if (voiceVolume) {
      utterThis.volume = voiceVolume;
    }

    handleCloseMoreMenu();
    const pauseSpeech = () => {
      window.speechSynthesis.pause();
    };

    const resumeSpeech = () => {
      window.speechSynthesis.resume();
    };

    const cancelSpeech = () => {
      window.speechSynthesis.cancel();
      toast.dismiss(SpeechToastId);
      handleCloseMoreMenu();
    };

    const SpeechToastId = toast(
      () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isPlaying, setIsPlaying] = useState<boolean>(true);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <span
              translate="yes"
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontWeight: 600,
                gap: "6px",
              }}
            >
              <RecordVoiceOver /> Read aloud: <span translate="no">{selectedTask?.name}</span>
            </span>
            <span translate="yes" style={{ marginTop: "10px", fontSize: "16px" }}>
              Voice: <span translate="no">{utterThis.voice?.name || "Default"}</span>
            </span>
            <div translate="no">
              <Marquee delay={0.6} play={isPlaying}>
                <p style={{ margin: "6px 0" }}>{utterThis.text} &nbsp;</p>
              </Marquee>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
                gap: "8px",
              }}
            >
              {isPlaying ? (
                <IconButton
                  sx={{ color: "white" }}
                  onClick={() => {
                    pauseSpeech();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  <Pause fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  sx={{ color: "white" }}
                  onClick={() => {
                    resumeSpeech();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  <PlayArrow fontSize="large" />
                </IconButton>
              )}

              <IconButton sx={{ color: "white" }} onClick={cancelSpeech}>
                <Cancel fontSize="large" />
              </IconButton>
            </div>
          </div>
        );
      },
      {
        duration: 999999999,
        style: {
          border: "1px solid #1b1d4eb7",
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        },
      }
    );

    // Set up event listener for the end of speech
    utterThis.onend = () => {
      // Close the menu
      handleCloseMoreMenu();
      // Hide the toast when speech ends
      toast.dismiss(SpeechToastId);
    };
    if (voiceVolume > 0) {
      window.speechSynthesis.speak(utterThis);
    }
  };

  const menuItems: JSX.Element = (
    <div>
      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          handleMarkAsDone();
        }}
      >
        {tasks.find((task) => task.id === selectedTaskId)?.done ? <Close /> : <Done />}
        &nbsp;{" "}
        {tasks.find((task) => task.id === selectedTaskId)?.done
          ? "Marcar como no hecho"
          : "Marcar como hecho"}
      </StyledMenuItem>
      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          handlePin();
        }}
      >
        <PushPinRounded sx={{ textDecoration: "line-through" }} />
        &nbsp; {tasks.find((task) => task.id === selectedTaskId)?.pinned ? "Fijar" : "Pin"}
      </StyledMenuItem>

      {selectedTasks.length === 0 && (
        <StyledMenuItem onClick={() => handleSelectTask(selectedTaskId || crypto.randomUUID())}>
          <RadioButtonChecked /> &nbsp; Seleccionar
        </StyledMenuItem>
      )}

      <StyledMenuItem onClick={redirectToTaskDetails}>
        <LaunchRounded /> &nbsp; Detalles de la tarea:
      </StyledMenuItem>

      {settings[0].enableReadAloud && (
        <StyledMenuItem
          onClick={handleReadAloud}
          disabled={window.speechSynthesis.speaking || window.speechSynthesis.pending}
        >
          <RecordVoiceOverRounded /> &nbsp; Leer en voz alta
        </StyledMenuItem>
      )}

      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          setShowShareDialog(true);
        }}
      >
        <LinkRounded /> &nbsp; Compartir
      </StyledMenuItem>

      <Divider />
      <StyledMenuItem
        onClick={() => {
          handleCloseMoreMenu();
          setEditModalOpen(true);
        }}
      >
        <EditRounded /> &nbsp; Editar
      </StyledMenuItem>
      <StyledMenuItem onClick={handleDuplicateTask}>
        <ContentCopy /> &nbsp; Duplicar
      </StyledMenuItem>
      <Divider />
      <StyledMenuItem
        clr={ColorPalette.red}
        onClick={() => {
          handleCloseMoreMenu();
          handleDeleteTask();
        }}
      >
        <DeleteRounded /> &nbsp; Eliminar
      </StyledMenuItem>
    </div>
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setShareTabVal(newValue);
  };
  return (
    <>
      {isMobile ? (
        <BottomSheet
          open={Boolean(anchorEl)}
          onDismiss={handleCloseMoreMenu}
          snapPoints={({ minHeight, maxHeight }) => [minHeight, maxHeight]}
          expandOnContentDrag
          header={
            <SheetHeader translate="no">
              <Emoji
                emojiStyle={emojisStyle}
                size={32}
                unified={tasks.find((task) => task.id === selectedTaskId)?.emoji || ""}
              />{" "}
              {emojisStyle === EmojiStyle.NATIVE && "\u00A0 "}
              {tasks.find((task) => task.id === selectedTaskId)?.name}
            </SheetHeader>
          }
        >
          <SheetContent>{menuItems}</SheetContent>
        </BottomSheet>
      ) : (
        <Menu
          id="task-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMoreMenu}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "18px",
              minWidth: "200px",
              boxShadow: "none",
              padding: "6px 4px",
            },
          }}
          MenuListProps={{
            "aria-labelledby": "more-button",
          }}
        >
          {menuItems}
        </Menu>
      )}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        PaperProps={{
          style: {
            borderRadius: "28px",
            padding: "10px",
            width: "560px",
          },
        }}
      >
        <DialogTitle>Compartir Tarea</DialogTitle>
        <DialogContent>
          <span>
            Compartir Tarea:{" "}
            <b translate="no">{tasks.find((task) => task.id === selectedTaskId)?.name}</b>
          </span>
          <Tabs value={shareTabVal} onChange={handleTabChange} sx={{ m: "8px 0" }}>
            <StyledTab label="Link" icon={<LinkRounded />} />
            <StyledTab label="Código QR" icon={<QrCode2Rounded />} />
          </Tabs>
          <CustomTabPanel value={shareTabVal} index={0}>
            <ShareField
              value={generateShareableLink(selectedTaskId, name || "User")}
              fullWidth
              variant="outlined"
              label="Enlace para compartir"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkRounded sx={{ ml: "8px" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => {
                        handleCopyToClipboard();
                      }}
                      sx={{ p: "12px", borderRadius: "14px", mr: "4px" }}
                    >
                      <ContentCopyRounded /> &nbsp; Copy
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 3,
              }}
            />
          </CustomTabPanel>
          <CustomTabPanel value={shareTabVal} index={1}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "22px",
              }}
            >
              <QRCode
                id="QRCodeShare"
                value={generateShareableLink(selectedTaskId, name || "User")}
                size={400}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DownloadQrCodeBtn
                variant="outlined"
                onClick={() =>
                  saveQRCode(tasks.find((task) => task.id === selectedTaskId)?.name || "")
                }
              >
                <DownloadRounded /> &nbsp; Descargarcódigo QR
              </DownloadQrCodeBtn>
            </Box>
          </CustomTabPanel>
          <Alert severity="info" sx={{ mt: "20px" }}>
            <AlertTitle>Compartir Tu Tarea</AlertTitle>
            Comparte tu tarea con los demás utilizando el enlace o el código QR. Copia el enlace para compartirlo manualmente o utiliza el botón de compartir para enviarlo a través de otras aplicaciones. También puedes descargar el código QR para acceder fácilmente.
          </Alert>
          {/* <Alert severity="warning" sx={{ mt: "8px" }}>
            Anyone with access to this link will be able to view your name and task details.
          </Alert> */}
        </DialogContent>
        <DialogActions>
          <DialogBtn onClick={() => setShowShareDialog(false)}>Close</DialogBtn>
          <DialogBtn onClick={handleShare}>
            <IosShare sx={{ mb: "4px" }} /> &nbsp; Share
          </DialogBtn>
        </DialogActions>
      </Dialog>
    </>
  );
};
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`share-tabpanel-${index}`}
      aria-labelledby={`share-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
const SheetHeader = styled.h3`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: ${ColorPalette.fontDark};
  margin: 10px;
  font-size: 20px;
`;

const SheetContent = styled.div`
  color: ${ColorPalette.fontDark};
  margin: 20px 10px;
  & .MuiMenuItem-root {
    font-size: 16px;
    padding: 16px;
    &::before {
      content: "";
      display: inline-block;
      margin-right: 10px;
    }
  }
`;
const StyledMenuItem = styled(MenuItem)<{ clr?: string }>`
  margin: 0 6px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: none;
  gap: 2px;
  color: ${({ clr }) => clr || ColorPalette.fontDark};

  &:hover {
    background-color: #f0f0f0;
  }
`;

const ShareField = styled(TextField)`
  margin-top: 22px;
  .MuiOutlinedInput-root {
    border-radius: 14px;
    padding: 2px;
    transition: 0.3s all;
  }
`;

const DownloadQrCodeBtn = styled(Button)`
  padding: 12px 24px;
  border-radius: 14px;
  margin-top: 16px;
  @media (max-width: 520px) {
    margin-top: -2px;
  }
`;
// p: "12px 24px",
// borderRadius: "14px",
const StyledTab = styled(Tab)`
  border-radius: 12px 12px 0 0;
  width: 50%;
  .MuiTabs-indicator {
    border-radius: 24px;
  }
`;
StyledTab.defaultProps = {
  iconPosition: "start",
};
