package com.ruralnetwork.structure;

import java.util.*;

/**
 * TasBinaire (Min-Heap)
 * Structure de données utilisée pour l'algorithme de Dijkstra
 * Complexité: Insertion O(log n), Extraction minimum O(log n)
 */
public class TasBinaire<T> {

    private List<ElementPriorite<T>> tas = new ArrayList<>();

    public static class ElementPriorite<T> {
        private T element;
        private Double priorite;

        public ElementPriorite() {}

        public ElementPriorite(T element, Double priorite) {
            this.element = element;
            this.priorite = priorite;
        }

        public T getElement() { return element; }
        public void setElement(T element) { this.element = element; }
        public Double getPriorite() { return priorite; }
        public void setPriorite(Double priorite) { this.priorite = priorite; }
    }

    private int obtenirParent(int index) {
        return (index - 1) / 2;
    }

    private int obtenirEnfantGauche(int index) {
        return 2 * index + 1;
    }

    private int obtenirEnfantDroit(int index) {
        return 2 * index + 2;
    }

    private void echanger(int index1, int index2) {
        ElementPriorite<T> temp = tas.get(index1);
        tas.set(index1, tas.get(index2));
        tas.set(index2, temp);
    }

    private void remonter(int index) {
        while (index > 0) {
            int parentIndex = obtenirParent(index);
            if (tas.get(index).getPriorite() >= tas.get(parentIndex).getPriorite()) {
                break;
            }
            echanger(index, parentIndex);
            index = parentIndex;
        }
    }

    private void descendre(int index) {
        while (true) {
            int plusPetitIndex = index;
            int gaucheIndex = obtenirEnfantGauche(index);
            int droitIndex = obtenirEnfantDroit(index);

            if (gaucheIndex < tas.size() &&
                tas.get(gaucheIndex).getPriorite() < tas.get(plusPetitIndex).getPriorite()) {
                plusPetitIndex = gaucheIndex;
            }

            if (droitIndex < tas.size() &&
                tas.get(droitIndex).getPriorite() < tas.get(plusPetitIndex).getPriorite()) {
                plusPetitIndex = droitIndex;
            }

            if (plusPetitIndex == index) {
                break;
            }

            echanger(index, plusPetitIndex);
            index = plusPetitIndex;
        }
    }

    public void inserer(T element, Double priorite) {
        tas.add(new ElementPriorite<>(element, priorite));
        remonter(tas.size() - 1);
    }

    public T extraireMin() {
        if (estVide()) {
            return null;
        }

        ElementPriorite<T> min = tas.get(0);
        ElementPriorite<T> dernier = tas.remove(tas.size() - 1);

        if (!estVide()) {
            tas.set(0, dernier);
            descendre(0);
        }

        return min.getElement();
    }

    public boolean estVide() {
        return tas.isEmpty();
    }

    public int taille() {
        return tas.size();
    }

    public void vider() {
        tas.clear();
    }
}
