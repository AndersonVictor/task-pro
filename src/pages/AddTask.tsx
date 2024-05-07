import { Category, Task } from "../types/user";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AddTaskButton, ColorPalette, Container, StyledInput } from "../styles";
import { AddTaskRounded, CancelRounded } from "@mui/icons-material";
import {  IconButton, InputAdornment, Tooltip } from "@mui/material";
import { DESCRIPTION_MAX_LENGTH, TASK_NAME_MAX_LENGTH } from "../constants";
import { CategorySelect, ColorPicker, TopBar, CustomEmojiPicker } from "../components";
import { UserContext } from "../contexts/UserContext";
import { useStorageState } from "../hooks/useStorageState";
import { useTheme } from "@emotion/react";
import { getFontColor, showToast } from "../utils";

const AddTask = () => {
  const { user, setUser } = useContext(UserContext);
  const theme = useTheme();
  const [name, setName] = useStorageState<string>("", "name", "sessionStorage");
  const [emoji, setEmoji] = useStorageState<string | null>(null, "emoji", "sessionStorage");
  const [color, setColor] = useStorageState<string>(theme.primary, "color", "sessionStorage");
  const [description, setDescription] = useStorageState<string>(
    "",
    "description",
    "sessionStorage"
  );
  const [deadline, setDeadline] = useStorageState<string>("", "deadline", "sessionStorage");
  const [nameError, setNameError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useStorageState<Category[]>(
    [],
    "categories",
    "sessionStorage"
  );

  const n = useNavigate();

  useEffect(() => {
    document.title = "Task Pro - Agregar Tarea";
    if (name.length > TASK_NAME_MAX_LENGTH) {
      setNameError(`El nombre debe tener menos o igual a ${TASK_NAME_MAX_LENGTH} caracteres`);
    } else {
      setNameError("");
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(
        `La descripción debe tener menos o igual a${DESCRIPTION_MAX_LENGTH} caracteres`
      );
    } else {
      setDescriptionError("");
    }
  }, [description.length, name.length]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setName(newName);
    if (newName.length > TASK_NAME_MAX_LENGTH) {
      setNameError(`La descripción debe tener menos o igual a ${TASK_NAME_MAX_LENGTH} caracteres`);
    } else {
      setNameError("");
    }
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = event.target.value;
    setDescription(newDescription);
    if (newDescription.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(
        `La descripción debe tener menos o igual a  ${DESCRIPTION_MAX_LENGTH} caracteres`
      );
    } else {
      setDescriptionError("");
    }
  };

  const handleDeadlineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(event.target.value);
  };

  const handleAddTask = () => {
    if (name === "") {
      showToast("NOmbre de tareas obligatoria.", { type: "error" });
      return;
    }

    if (nameError !== "" || descriptionError !== "") {
      return; // Do not add the task if the name or description exceeds the maximum length
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      done: false,
      pinned: false,
      name,
      description: description !== "" ? description : undefined,
      emoji: emoji ? emoji : undefined,
      color,
      date: new Date(),
      deadline: deadline !== "" ? new Date(deadline) : undefined,
      category: selectedCategories ? selectedCategories : [],
    };

    setUser((prevUser) => ({
      ...prevUser,
      tasks: [...prevUser.tasks, newTask],
    }));

    n("/");

    showToast(
      <div>
        Agregar tarea- <b>{newTask.name}</b>
      </div>,
      {
        icon: <AddTaskRounded />,
      }
    );

    const itemsToRemove = ["name", "color", "description", "emoji", "deadline", "categories"];
    itemsToRemove.map((item) => sessionStorage.removeItem(item));
  };

  return (
    <>
      <TopBar title="Agregar una nueva Tarea" />
      <Container>
        <CustomEmojiPicker
          emoji={typeof emoji === "string" ? emoji : undefined}
          setEmoji={setEmoji}
          color={color}
          theme={getFontColor(theme.secondary) === ColorPalette.fontDark ? "light" : "dark"}
        />
        <StyledInput
          label="Nombre de la Tarea"
          name="name"
          placeholder="Ingrese nombre de la tarea"
          autoComplete="off"
          value={name}
          onChange={handleNameChange}
          focused
          required
          error={nameError !== ""}
          helpercolor={nameError && ColorPalette.red}
          helperText={
            name === ""
              ? undefined
              : !nameError
              ? `${name.length}/${TASK_NAME_MAX_LENGTH}`
              : nameError
          }
        />
        <StyledInput
          label="Descripción de la Tarea (opcional)"
          name="name"
          placeholder="Ingrese descripción de la tarea"
          autoComplete="off"
          value={description}
          onChange={handleDescriptionChange}
          multiline
          rows={4}
          focused
          error={descriptionError !== ""}
          helpercolor={descriptionError && ColorPalette.red}
          helperText={
            description === ""
              ? undefined
              : !descriptionError
              ? `${description.length}/${DESCRIPTION_MAX_LENGTH}`
              : descriptionError
          }
        />
        <StyledInput
          label="Tiempo limite (opcional)"
          name="name"
          placeholder=""
          type="datetime-local"
          value={deadline}
          onChange={handleDeadlineChange}
          defaultValue=""
          focused
          sx={{
            colorScheme: getFontColor(theme.secondary) === ColorPalette.fontDark ? "light" : "dark",
          }}
          InputProps={{
            startAdornment:
              deadline && deadline !== "" ? (
                <InputAdornment position="start">
                  <Tooltip title="Clear">
                    <IconButton color="error" onClick={() => setDeadline("")}>
                      <CancelRounded />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : undefined,
          }}
        />
        {user.settings[0].enableCategories !== undefined && user.settings[0].enableCategories && (
          <>
            <br />
            <CategorySelect
              selectedCategories={selectedCategories}
              onCategoryChange={(categories) => setSelectedCategories(categories)}
              width="400px"
              fontColor={getFontColor(theme.secondary)}
            />
           
          </>
        )}
        <ColorPicker
          color={color}
          width="400px"
          onColorChange={(color) => {
            setColor(color);
          }}
          fontColor={getFontColor(theme.secondary)}
        />
        <AddTaskButton
          onClick={handleAddTask}
          disabled={
            name.length > TASK_NAME_MAX_LENGTH || description.length > DESCRIPTION_MAX_LENGTH
          }
        >
          Crear Tarea
        </AddTaskButton>
      </Container>
    </>
  );
};

export default AddTask;
